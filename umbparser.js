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
    PARSER_IDLE : 0,
    PARSER_PROCESSING : 1,
    PARSER_ERROR : 2,
    PARSER_FINISHED : 3,
}
//!@}

class UMBParser {
    
    constructor() {
        this.readBuffer = new ArrayBuffer();
        this.parsingIdx = 0;
        this.parsingSOHIdx = 0;
        this.frameState = FRAME_STATE.PAR_SOH;
        this.parserState = PAR_STATE.PARSER_PROCESSING;
    }

    ParseReadBuf(curBuffer)
    {
        // gs 170816 return immediately if readLen == 0, handleTransfer now calls the parser also when no characters received (Modbus RTU)
        if (curBuffer.length == 0)
        {
            return;
        }

        // Push curent data
        this.readBuffer.push(curBuffer);

        this.parsingIdx = 0;
        while(pthis.arsingIdx < this.readBuffer.length)
        {
            switch(this.frameState)
            {
            case FRAME_STATE.PAR_SOH:
                if(this.readBuffer[parsingIdx] == UMBFRAME_SOH_VAL)
                {
                    this.parserState = PAR_STATE.PARSER_PROCESSING;
                    this.frameState = FRAME_STATE.PAR_VER;
                    this.parsingSOHIdx = parsingIdx;
                }
                else
                {
                    this.parserState = PAR_STATE.PARSER_ERROR;
                }
                break;
    
            case FRAME_STATE.PAR_VER:
                //@note: This parser currently only supports UMB-V1.0
                if(this.readBuffer[parsingIdx] == UMBFRAME_VERSION_V10)
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
                this.frameLength = this.readBuffer[parsingIdx];
                if(this.frameLength < UMBFRAME_MAX_LENGTH)
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
                if(this.readBuffer[this.parsingIdx] == UMBFRAME_STX_VAL)
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
                    break;
                }
                else
                {
                    this.frameState = FRAME_STATE.PAR_ETX;
                    /* @note: Fall-Through!! */
                }
                /* no break */
    
            case FRAME_STATE.PAR_ETX:
                if(this.readBuffer[this.parsingIdx] == UMBFRAME_ETX_VAL)
                {
                    this.frameState = PAR_STATE.PAR_CRC_LSB;
                }
                else
                {
                    this.parserState = PARSER_STATUE.PARSER_ERROR;
                }
                break;
    
            case FRAME_STATE.PAR_CRC_LSB:
                this.frameState = PAR_STATE.PAR_CRC_MSB;
                break;
            case FRAME_STATE.PAR_CRC_MSB:
                this.frameState = PAR_STATE.PAR_EOT;
                break;
            case FRAME_STATE.PAR_EOT:
                if(this.readBuffer[this.parsingIdx] == UMBFRAME_EOT_VAL)
                {
                    /**
                     * At this state it looks like have a valid UMB Frame
                     **/
                    this.frameLength = 0;

                    /* We need to initialize UMB_FRAME_T manually */
                    /* @TODO */
                    
                    this.parserState = PARSER_STATUE.PARSER_FINISHED;
                }
                else
                {
                    this.parserState = PARSER_STATUE.PARSER_ERROR;
                }
                break;
    
            default:
                this.parserState = PARSER_STATUE.PARSER_ERROR;
                break;
            } // switch END

            this.parsingIdx++;

            /* Check parsing state*/
            if(this.parserState == PARSER_STATUE.PARSER_ERROR)
            {
                /* start parsing at last SOH */
                this.readBuffer.slice(this.parsingSOHIdx);
                this.parsingSOHIdx = 0;
                this.parsingIdx = 0;
                this.frameState = FRAME_STATE.PAR_SOH;
                break;
            }
        }

        return parserState;
    }
    
}



module.exports.UMBParser = UMBParser;