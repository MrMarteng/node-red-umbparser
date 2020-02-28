const CRC = require('crc-full').CRC;
const umb_consts = require('./umb_consts').umb_consts;
        
const FRAME_STATE =
{
    PAR_SOH : 0,
    PAR_VER : 1,
    PAR_LO_LSB : 2,
    PAR_TO_MSB : 3,
    PAR_FROM_LSB : 4,
    PAR_FROM_MSB : 5,
    PAR_LEN : 6,
    PAR_STX : 7,
    PAR_CMD : 8,
    PAR_CMD_VER : 9,
    PAR_PAYLOAD : 10,
    PAR_ETX : 11,
    PAR_CRC_LSB : 12,
    PAR_CRC_MSB : 13,
    PAR_EOT : 14
}

//!< @name Parser status
//!@{
const PAR_STATE =
{
    PARSER_IDLE : 'idle',
    PARSER_PROCESSING : 'prcoessing',
    PARSER_ERROR : 'error',
    PARSER_CRCERROR : 'crc_error',
    PARSER_FINISHED : 'finished',
}
//!@}

const FRAME_TYPE =
{
    REQUEST: 'request',
    RESPONSE: 'response',
    UNKOWN: 'unknown'
}

class UMBFrame {
    constructor() {
        this.type = 'Unknown';
        this.payload = new Uint8Array();
        this.cmd = 0;
        this.status = -1;
        this.CRC = 0xFFFF;
    }
}


class UMBParser {

    constructor() {
        this.readBuffer = [];
        this.parsingIdx = 0;
        this.parsingSOHIdx = 0;
        this.parsingETXIdx = 0;
        this.parsingCRC = 0;
        this.payloadCnt = 0;
        this.frameState = FRAME_STATE.PAR_SOH;
        this.parserState = PAR_STATE.PARSER_PROCESSING;
        this.payload = [];
        this.CRC = new CRC("CRC16", 16, 0x1021, 0xFFFF, 0x0000, true, true);
    }

    // Returns the 8-bit checksum given an array of byte-sized numbers
    calcCRC(byte_array) 
    {
        return this.CRC.compute(byte_array);
    } 

    resetParser() 
    {
        this.readBuffer.slice(this.parsingSOHIdx);
        this.parsingSOHIdx = 0;
        this.parsingIdx = 0;
        this.payloadCnt = 0;
        this.parsingETXIdx = 0;
        this.frameState = FRAME_STATE.PAR_SOH;
    }

    ParseReadBuf(curBuffer)
    {
        // return immediately if readLen == 0, handleTransfer now calls the parser also when no characters received (Modbus RTU)
        if ((typeof curBuffer == ArrayBuffer) && (curBuffer.length == 0))
        {
            return;
        }

        // Push curent data
        this.readBuffer = curBuffer;

        this.parsingIdx = 0;
        while(this.parsingIdx < this.readBuffer.length)
        {
            switch(this.frameState)
            {
            case FRAME_STATE.PAR_SOH:
                if(this.readBuffer[this.parsingIdx] == umb_consts.UMBFRAME_VAL.SOH)
                {
                    this.parserState = PAR_STATE.PARSER_PROCESSING;
                    this.frameState = FRAME_STATE.PAR_VER;
                    this.parsingSOHIdx = this.parsingIdx;
                }
                else
                {
                    this.parserState = PAR_STATE.PARSER_ERROR;
                }
                break;
    
            case FRAME_STATE.PAR_VER:
                //@note: This parser currently only supports UMB-V1.0
                if(this.readBuffer[this.parsingIdx] == umb_consts.UMBFRAME_VERSION_V10)
                {
                    this.frameState = FRAME_STATE.PAR_LO_LSB;
                }
                else
                {
                    this.parserState = PAR_STATE.PARSER_ERROR;
                }
                break;
    
            case FRAME_STATE.PAR_LO_LSB:
                this.frameState = FRAME_STATE.PAR_TO_MSB;
                break;
            case FRAME_STATE.PAR_TO_MSB:
                this.frameState = FRAME_STATE.PAR_FROM_LSB;
                break;
            case FRAME_STATE.PAR_FROM_LSB:
                this.frameState = FRAME_STATE.PAR_FROM_MSB;
                break;
            case FRAME_STATE.PAR_FROM_MSB:
                this.frameState = FRAME_STATE.PAR_LEN;
                break;
    
            case FRAME_STATE.PAR_LEN:
                this.frameLength = this.readBuffer[this.parsingIdx];
                if(this.frameLength < umb_consts.UMBFRAME_MAX_LENGTH)
                {
                    this.payloadCnt = 0;
                    this.frameState = FRAME_STATE.PAR_STX;
                }
                else
                {
                    this.frameState = FRAME_STATE.PARSER_ERROR;
                }
                break;
    
            case FRAME_STATE.PAR_STX:
                if(this.readBuffer[this.parsingIdx] == umb_consts.UMBFRAME_VAL.STX)
                {
                    this.frameState = FRAME_STATE.PAR_CMD;
                }
                else
                {
                    this.frameState = FRAME_STATE.PARSER_ERROR;
                }
                break;
    
            case FRAME_STATE.PAR_CMD:
                this.frameState = FRAME_STATE.PAR_CMD_VER;
                break;
            case FRAME_STATE.PAR_CMD_VER:
                this.frameState = FRAME_STATE.PAR_PAYLOAD;
                break;
    
            case FRAME_STATE.PAR_PAYLOAD:
                this.payloadCnt++;

                /* <CMD><VERC> are also included in <LEN>-field */
                if(this.payloadCnt <= (this.frameLength - 2))
                {
                    /* Payload data */
                    this.payload[this.payloadCnt-1] = this.readBuffer[this.parsingIdx];
                    break;
                }
                else
                {
                    this.frameState = FRAME_STATE.PAR_ETX;
                    /* @note: Fall-Through!! */
                }
                /* no break */
    
            case FRAME_STATE.PAR_ETX:
                if(this.readBuffer[this.parsingIdx] == umb_consts.UMBFRAME_VAL.ETX)
                {
                    this.parsingETXIdx = this.parsingIdx;
                    this.frameState = FRAME_STATE.PAR_CRC_LSB;
                }
                else
                {
                    this.parserState = PAR_STATE.PARSER_ERROR;
                }
                break;
    
            case FRAME_STATE.PAR_CRC_LSB:
                this.frameState = FRAME_STATE.PAR_CRC_MSB;
                this.parsingCRC = this.readBuffer[this.parsingIdx];
                break;
            case FRAME_STATE.PAR_CRC_MSB:
                this.parsingCRC |= (this.readBuffer[this.parsingIdx] << 8);

                let crc = this.calcCRC(this.readBuffer.slice(0, this.parsingETXIdx+1));

                if(crc == this.parsingCRC)
                {
                    this.frameState = FRAME_STATE.PAR_EOT;
                }
                else
                {
                    this.parserState = PAR_STATE.PARSER_CRCERROR;
                }
                break;
            case FRAME_STATE.PAR_EOT:
                if(this.readBuffer[this.parsingIdx] == umb_consts.UMBFRAME_VAL.EOT)
                {
                    /**
                     * At this state it looks like have a valid UMB Frame
                     **/
                    this.frameLength = 0;

                    /* We need to initialize UMB_FRAME_T manually */
                    /* @TODO */
                    
                    this.parserState = PAR_STATE.PARSER_FINISHED;
                }
                else
                {
                    this.parserState = PAR_STATE.PARSER_ERROR;
                }
                break;
    
            default:
                this.parserState = PAR_STATE.PARSER_ERROR;
                break;
            } // switch END

            this.parsingIdx++;

            /* Check parsing state*/
            if(this.parserState == PAR_STATE.PARSER_ERROR)
            {
                /* start parsing at last SOH */
                this.resetParser();
                break;
            }
        }

        let parsedFrame = new UMBFrame();
        if(this.parserState == PAR_STATE.PARSER_FINISHED)
        {
            parsedFrame.FromAddr = (this.readBuffer[umb_consts.UMBFRAME_IDX.FROM_ADDR+1] << 8) | this.readBuffer[umb_consts.UMBFRAME_IDX.FROM_ADDR];
            parsedFrame.ToAddr = (this.readBuffer[umb_consts.UMBFRAME_IDX.TO_ADDR+1] << 8) | this.readBuffer[umb_consts.UMBFRAME_IDX.TO_ADDR];
            parsedFrame.cmd = this.readBuffer[umb_consts.UMBFRAME_IDX.CMD];
            parsedFrame.payload = this.payload;
            parsedFrame.crc = this.calcCRC(this.readBuffer.slice(0, this.parsingETXIdx));
            if(((parsedFrame.FromAddr & 0xF000) == 0xF000) && ((parsedFrame.ToAddr & 0xF000) != 0xF000))
            {
                parsedFrame.type = FRAME_TYPE.REQUEST;
            }
            else if(((parsedFrame.FromAddr & 0xF000) != 0xF000) && ((parsedFrame.ToAddr & 0xF000) == 0xF000))
            {
                parsedFrame.type = FRAME_TYPE.RESPONSE;
                parsedFrame.status = this.payload[0];
            }
            else
            {
                parsedFrame.type = FRAME_TYPE.UNKOWN;
            }

            this.resetParser();
        }
        
        let retval = {
            parserState: this.parserState,
            umbframe: parsedFrame
        }

        return retval;
    }
    
}

module.exports.UMBParser = UMBParser;