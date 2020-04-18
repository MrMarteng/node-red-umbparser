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
    UNKNOWN: 'unknown'
}

class UMBFrame 
{
    constructor() 
    {
        this.type = FRAME_TYPE.UNKNOWN;
        this.payload = new Uint8Array();
        this.cmd = 0;
        this.status = -1;
        this.CRC = 0xFFFF;
        this.parsedData;
    }
}


class MeasChVal
{
    constructor() 
    {
        this.ch_number = 0;      //!< Kanalnummer
        this.ch_value = 0;       //!< aktueller Wert des Kanals
        this.ch_data_type = 0;   //!< Datentype
        this.ch_status = 0;      //!< UMB-Status        
    }
}


class UMBParser 
{

    constructor() 
    {
        this.readBuffer = [];
        this.parsingIdx = 0;
        this.parsingSOHIdx = 0;
        this.parsingETXIdx = 0;
        this.parsingCRC = 0;
        this.payloadCnt = 0;
        this.frameState = FRAME_STATE.PAR_SOH;
        this.parserState = PAR_STATE.PARSER_PROCESSING;
        this.payload = new Uint8Array();
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
        this.payload = new Uint8Array();
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
                if( (this.frameLength < umb_consts.UMBFRAME_MAX_LENGTH) &&
                    (this.frameLength > 2) )
                {
                    this.payloadCnt = 0;
                    this.payload = new Uint8Array(this.frameLength - 2);
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
                    this.payload.set([this.readBuffer[this.parsingIdx]], this.payloadCnt-1);
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
            if((this.parserState == PAR_STATE.PARSER_ERROR) || (this.parserState == PAR_STATE.PARSER_CRCERROR))
            {
                /* start parsing at last SOH */
                this.resetParser();
                break;
            }
        }

        // Finish parsing frame
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
                parsedFrame.type = FRAME_TYPE.UNKNOWN;
            }

            // Analyse command
            if((parsedFrame.type == FRAME_TYPE.RESPONSE) && (parsedFrame.status == umb_consts.ERROR_STATUS.STATUS_OK))
            {
                switch(parsedFrame.cmd)
                {
                    case umb_consts.UMB_CMD.GETMULTICHANNEL:
                        parsedFrame.parsedData = this.cmdRespChData();
                        break;
                }
            }

            this.resetParser();
        }
        
        let retval = {
            parserState: this.parserState,
            umbframe: parsedFrame
        }

        return retval;
    }
    
    cmdRespChData()
    {
        let numChannels = this.payload[1];
        let index = 2;
        let chData = new Array();

        for(let i=0; i<numChannels; i++)
        {
            let curChData = new MeasChVal();
            let curDataLen = this.payload[index];
            let curDataView = new DataView(this.payload.buffer, index+1, curDataLen);
            curChData.ch_status = curDataView.getUint8(0);
            curChData.ch_number = curDataView.getUint16(1, true);
            curChData.ch_data_type = curDataView.getUint8(3);

            if(curChData.ch_status == umb_consts.ERROR_STATUS.STATUS_OK)
            {
                switch(curChData.ch_data_type)
                {
                    case 0x10:
                        curChData.ch_data_type = "UCHAR";
                        curChData.ch_value = curDataView.getUint8(4);
                        break;
                    case 0x11:
                        curChData.ch_data_type = "SCHAR";
                        curChData.ch_value = curDataView.getInt8(4);
                        break;
                    case 0x12:
                        curChData.ch_data_type = "USHORT";
                        curChData.ch_value = curDataView.getUint16(4, true);
                        break;
                    case 0x13:
                        curChData.ch_data_type = "SSHORT";
                        curChData.ch_value = curDataView.getInt16(4, true);
                        break;
                    case 0x14:
                        curChData.ch_data_type = "ULONG";
                        curChData.ch_value = curDataView.getUint32(4, true);
                        break;
                    case 0x15:
                        curChData.ch_data_type = "SLONG";
                        curChData.ch_value = curDataView.getInt32(4, true);
                        break;
                    case 0x16:
                        curChData.ch_data_type = "FLOAT";
                        curChData.ch_value = curDataView.getFloat32(4, true);
                        break;
                    case 0x17:
                        curChData.ch_data_type = "DOUBLE";
                        curChData.ch_value = curDataView.getFloat64(4, true);
                        break;
                }
            }
            
            chData.push(curChData);

            index += curDataLen+1;
        }

        return chData;
    }

}

class UMBGenerator 
{

    constructor() 
    {
        this.readBuffer = [];       
        this.CRC = new CRC("CRC16", 16, 0x1021, 0xFFFF, 0x0000, true, true);
    }

    createReq(cmd, cmd_ver, to_addr, from_addr) 
    {
        this.readBuffer[umb_consts.UMBFRAME_IDX.SOH] = umb_consts.UMBFRAME_VAL.SOH;
        this.readBuffer[umb_consts.UMBFRAME_IDX.VER] = umb_consts.UMBFRAME_VERSION_V10;
        this.readBuffer[umb_consts.UMBFRAME_IDX.STX] = umb_consts.UMBFRAME_VAL.STX;
        this.readBuffer[umb_consts.UMBFRAME_IDX.LEN] = 2;
        this.readBuffer[umb_consts.UMBFRAME_IDX.TO_ADDR] = to_addr & 0xFF;
        this.readBuffer[umb_consts.UMBFRAME_IDX.TO_ADDR+1] = (to_addr & 0xFF00) >> 8;
        this.readBuffer[umb_consts.UMBFRAME_IDX.FROM_ADDR] = from_addr & 0xFF;
        this.readBuffer[umb_consts.UMBFRAME_IDX.FROM_ADDR+1] = (from_addr & 0xFF00) >>8;
        this.readBuffer[umb_consts.UMBFRAME_IDX.CMD] = cmd;
        this.readBuffer[umb_consts.UMBFRAME_IDX.CMDV] = cmd_ver;
    }

    // Returns the 8-bit checksum given an array of byte-sized numbers
    calcCRC(byte_array) 
    {
        return this.CRC.compute(byte_array);
    } 

    genFrameCRCEnd(payloadLength)
    {
        let crc = 0xFFFF;
        let newFrameLength;

        this.readBuffer[umb_consts.UMBFRAME_IDX.LEN] = payloadLength + 2;
        newFrameLength = umb_consts.UMBFRAME_FRAME_LENGTH_OVERHEAD + this.readBuffer[umb_consts.UMBFRAME_IDX.LEN];

        this.readBuffer[newFrameLength - 4] = umb_consts.UMBFRAME_VAL.ETX;

        crc = this.calcCRC(this.readBuffer.slice(0, newFrameLength - 3))
        this.readBuffer[newFrameLength - 2] = (crc >> 8) & 0xFF;
        this.readBuffer[newFrameLength - 3] = crc & 0xFF;

        this.readBuffer[newFrameLength - 1] = umb_consts.UMBFRAME_VAL.EOT;

    }

    getPayloadDataIndex(frame_type)
    {
        let uDataIdx = (umb_consts.UMBFRAME_IDX.CMDV + 1);
    
        switch (frame_type)
        {
        case FRAME_TYPE.RESPONSE:
            //@TODO
            //if (UmbDispatcher_HasSubCmd(UMBFrame_getCmd(pFrame), UMBFrame_getCmdVer(pFrame)))
            if(0)
            {
                uDataIdx = (umb_consts.UMBFRAME_IDX.SUBCMD + 1);
            }
            else
            {
                uDataIdx = (umb_consts.UMBFRAME_IDX.RES_STATUS + 1);
            }
            break;
    
        case FRAME_TYPE.REQUEST:
            //@TODO
            //if (UmbDispatcher_HasSubCmd(UMBFrame_getCmd(pFrame), UMBFrame_getCmdVer(pFrame)))
            if(0)
            {
                uDataIdx = (umb_consts.UMBFRAME_IDX.SUBCMD + 1);
            }
            else
            {
                uDataIdx = (umb_consts.UMBFRAME_IDX.CMDV + 1);
            }
            break;    
        default:
            uDataIdx = (umb_consts.UMBFRAME_IDX.CMDV + 1);
            break;
        }
    
        return uDataIdx;
    }
    
    createMultiChReq(to_addr, channellist) 
    {
        //@TODO Master address?
        this.createReq(umb_consts.UMB_CMD.GETMULTICHANNEL, 0x10, to_addr, 0xF001);
        let payloadIndex = this.getPayloadDataIndex(FRAME_TYPE.REQUEST);
        let payloadLength = 1+channellist.length*2;

        let chbuf = new Uint8Array(payloadLength);
        let chbuf_view = new DataView(chbuf.buffer);

        // [0] - <num channels>
        chbuf_view.setUint8(0, channellist.length);
        
        // [1..n] - <channels>^2
        for(let i=0; i<channellist.length; i++)
        {
            chbuf_view.setUint16(1+i*2, channellist[i], true);
        }

        for(let i=0; i<chbuf.length; i++) 
        {
            this.readBuffer[payloadIndex+i] = chbuf[i];
        }
        
        this.genFrameCRCEnd(payloadLength);

        return Buffer.from(this.readBuffer);
    }
}

module.exports.UMBParser = UMBParser;
module.exports.UMBGenerator = UMBGenerator;
module.exports.MeasChVal = MeasChVal;
