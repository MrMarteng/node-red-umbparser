
//! @name  UMB frame character position (index)
//! UMB frame layout
//!
//!  0  |   1     |  2-3   | 4-5      | 6       | 7   |   8     |   9      | 10 - (7+len) | 8+len | (9+len) - (10+len) | 11+len
//! --- | ------- | ------ | -------- | ------- | --- | ------- | -------- | ------------ | ----- | ------------------ | ------
//! SOH | \<ver\> | \<to\> | \<from\> | \<len\> | STX | \<cmd\> | \<verc\> | \<payload\>  | ETX   | \<cs\>             | EOT
//!
//@{
const UMBFRAME_SOH_IDX              =  0;    //!< Index of SOH in UMB frame buf
const UMBFRAME_VER_IDX              =  1;    //!< Frame index of frame version identifier
const UMBFRAME_SOH_VAL              =  0x01; //!< Start of Header
const UMBFRAME_FROM_ADDR_IDX        =  4;    //!< Frame index of destination address
const UMBFRAME_TO_ADDR_IDX          =  2;    //!< Frame index of destination address
const UMBFRAME_STX_IDX              =  7;    //!< Frame index for StartOfTXData identifier
const UMBFRAME_LEN_IDX              =  6;    //!< Frame length field frame index
const UMBFRAME_STX_VAL              =  0x02; //!< StartOfTXData identifier value
const UMBFRAME_CMD_IDX              =  8;    //!< Command field frame index
const UMBFRAME_CMDV_IDX             =  9;    //!< Command version field frame index
const UMBFRAME_SUBCMD_IDX           =  10;   //!< SubCommand field frame index
const UMBFRAME_ETX_VAL              =  0x03; //!< End of TXData
const UMBFRAME_EOT_VAL              =  0x04; //!< End of transmission
const UMBRESPONSE_STATUS_IDX        =  10;   //!< The first byte of payload data defines the status of a response
const UMBRESPONSE_SUBCMD_IDX        =  11;   //!< SubCommand field frame index
const UMBREQUEST_SUBCMD_IDX         =  10;   //!< SubCommand field frame index
//@}

const UMBFRAME_VERSION_V10          = 0x10;
const UMBFRAME_MAX_FRAMELENGTH      = 255;
const UMBFRAME_FRAME_LENGTH_OVERHEAD = 12;
const UMBFRAME_MAX_PAYLOAD_LENGTH   = (UMBFRAME_MAX_FRAMELENGTH - UMBFRAME_FRAME_LENGTH_OVERHEAD - 2 - 2);
const UMBFRAME_MAX_LENGTH           = (UMBFRAME_MAX_FRAMELENGTH - UMBFRAME_FRAME_LENGTH_OVERHEAD - 2);


const UMB_CMD = {
    UMB_CMD_GET_HWSW_VERSION : 0x20,
    UMB_CMD_E2_READ : 0x21,
    UMB_CMD_E2_WRITE : 0x22,
    UMB_CMD_GETCHANNEL : 0x23,

    UMB_CMD_RESET : 0x25,
    UMB_CMD_STATUS : 0x26,
    UMB_CMD_TIME_SET : 0x27,
    UMB_CMD_TIME_GET : 0x28,
    UMB_CMD_TEST : 0x29,
    UMB_CMD_MONITOR : 0x2A,
    UMB_CMD_SET_PROTOCOL : 0x2B,
    UMB_CMD_GET_LASTSTATUS : 0x2C,
    UMB_CMD_GETDEVINFO : 0x2D,
    UMB_CMD_RESET_DELAY : 0x2E,
    UMB_CMD_GETMULTICHANNEL : 0x2F,
    UMB_CMD_SET_NEW_DEVICE_ID : 0x30,

    UMB_CMD_TUNNEL : 0x36,
    UMB_CMD_FWUPDATE : 0x37,
    UMB_CMD_BINDATA : 0x38,

    UMB_CMD_E2_WRITE_PIN : 0xF0,
}

const UMB_CMDVER = {
    UMB_CMDVER_10 : 0x10,
    UMB_CMDVER_11 : 0x11,
} 

//!< Some UMB commands require a (secret) PIN
const UMB_E2WRITE_PIN   =  0x2209
const UMB_TESTADJUST_PIN = 0x7322

const UMB_SUMBCMD = {
    UMB_SUBCMD_NONE : 0,

    UMB_SUBCMD_FWUPDATE_INIT : 0x01,
    UMB_SUBCMD_FWUPDATE_GET_STATUS : 0x02,
    UMB_SUBCMD_FWUPDATE_TX : 0x10,

    UMB_SUBCMD_TEST_ADJ_START : 0x10,
    UMB_SUBCMD_TEST_ADJ_STOP : 0x11,
    UMB_SUBCMD_TEST_ADJ_DEFAULTS : 0x12,
    UMB_SUBCMD_TEST_EXT_START : 0x13,
    UMB_SUBCMD_TEST_EXT_STOP : 0x14,
    UMB_SUBCMD_TEST_GET_TOTAL_ADJ_STATUS : 0x15,

    UMB_SUBCMD_TEST_PORT_PIN_READ          : 0x20,
    UMB_SUBCMD_TEST_PORT_PIN_WRITE         : 0x21,
    UMB_SUBCMD_TEST_PORT_READ              : 0x22,
    UMB_SUBCMD_TEST_PORT_WRITE             : 0x23,

    UMB_SUBCMD_BINDATA_BLOCKLEN : 0x10,
    UMB_SUBCMD_BINDATA_OBJINFO : 0x11,
    UMB_SUBCMD_BINDATA_OBJLOCK : 0x12,
    UMB_SUBCMD_BINDATA_OBJUNLOCK : 0x13,
    UMB_SUBCMD_BINDATA_OBJCRC : 0x14,
    UMB_SUBCMD_BINDATA_OBJRX : 0x20,
    UMB_SUBCMD_BINDATA_OBJTX : 0x30,

    UMB_SUBCMD_GETDEVINFO_DEVNAME : 0x10,
    UMB_SUBCMD_GETDEVINFO_DESCRIPTION : 0x11,
    UMB_SUBCMD_GETDEVINFO_HWSW_VERSION : 0x12,
    UMB_SUBCMD_GETDEVINFO_EXTINFO : 0x13,
    UMB_SUBCMD_GETDEVINFO_EESIZE : 0x14,
    UMB_SUBCMD_GETDEVINFO_GET_CH_NUM : 0x15,
    UMB_SUBCMD_GETDEVINFO_GET_CH : 0x16,
    UMB_SUBCMD_GETDEVINFO_EXT_VER_NUM : 0x17,
    UMB_SUBCMD_GETDEVINFO_EXT_VER_INFO : 0x18,
    UMB_SUBCMD_GETDEVINFO_GET_CH_NAME : 0x20,
    UMB_SUBCMD_GETDEVINFO_GET_CH_RANGE : 0x21,
    UMB_SUBCMD_GETDEVINFO_GET_CH_UNIT : 0x22,
    UMB_SUBCMD_GETDEVINFO_GET_CH_DATATYPE : 0x23,
    UMB_SUBCMD_GETDEVINFO_GET_CH_TYPE : 0x24,
    UMB_SUBCMD_GETDEVINFO_GET_CH_INFO : 0x30,
    UMB_SUBCMD_GETDEVINFO_GET_IP_NUM : 0x40,
    UMB_SUBCMD_GETDEVINFO_GET_IP_INFO : 0x41,
}
        
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
    
    // This "enum" can be used to indicate what kind of CRC8 checksum you will be calculating
    CRC8POLY = {
        CRC8 : 0xd5,
        CRC8_CCITT : 0x07,
        CRC8_DALLAS_MAXIM : 0x31,
        CRC8_SAE_J1850 : 0x1D,
        CRC_8_WCDMA : 0x9b,
    }

    constructor() {
        this.readBuffer = [];
        this.parsingIdx = 0;
        this.parsingSOHIdx = 0;
        this.parsingETXIdx = 0;
        this.payloadCnt = 0;
        this.frameState = FRAME_STATE.PAR_SOH;
        this.parserState = PAR_STATE.PARSER_PROCESSING;
        this.payload = [];
        this.CRCtable = this.generateCRCTable(this.CRC8POLY.CRC8_CCITT);
    }

    // Returns the 8-bit checksum given an array of byte-sized numbers
    calcCRC(byte_array) 
    {
        var c = 0

        for (var i = 0; i < byte_array.length; i++ )
        { 
            c = this.CRCtable[(c ^ byte_array[i]) % 256] 
        }

        return c;
    } 

    // returns a lookup table byte array given one of the values from CRC8.POLY 
    generateCRCTable(polynomial)
    {
        var csTable = [] // 256 max len byte array

        for ( var i = 0; i < 256; ++i ) 
        {
            var curr = i
            for ( var j = 0; j < 8; ++j ) 
            {
                if ((curr & 0x80) !== 0) 
                {
                    curr = ((curr << 1) ^ polynomial) % 256
                } else 
                {
                    curr = (curr << 1) % 256
                }
            }
            csTable[i] = curr 
        }
            
        return csTable
    }
    
    ParseReadBuf(curBuffer)
    {
        // return immediately if readLen == 0, handleTransfer now calls the parser also when no characters received (Modbus RTU)
        if ((typeof curBuffer == ArrayBuffer) && (curBuffer.length == 0))
        {
            return;
        }

        // Push curent data
        //this.readBuffer.concat(curBuffer);
        this.readBuffer = curBuffer;

        this.parsingIdx = 0;
        while(this.parsingIdx < this.readBuffer.length)
        {
            switch(this.frameState)
            {
            case FRAME_STATE.PAR_SOH:
                if(this.readBuffer[this.parsingIdx] == UMBFRAME_SOH_VAL)
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
                if(this.readBuffer[this.parsingIdx] == UMBFRAME_VERSION_V10)
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
                if(this.readBuffer[this.parsingIdx] == UMBFRAME_ETX_VAL)
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
                break;
            case FRAME_STATE.PAR_CRC_MSB:
                this.frameState = FRAME_STATE.PAR_EOT;
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
                this.readBuffer.slice(this.parsingSOHIdx);
                this.parsingSOHIdx = 0;
                this.parsingIdx = 0;
                this.payloadCnt = 0;
                this.parsingETXIdx = 0;
                this.frameState = FRAME_STATE.PAR_SOH;
                break;
            }
        }

        let parsedFrame = new UMBFrame();
        if(this.parserState == PAR_STATE.PARSER_FINISHED)
        {
            parsedFrame.FromAddr = (this.readBuffer[UMBFRAME_FROM_ADDR_IDX+1] << 8) | this.readBuffer[UMBFRAME_FROM_ADDR_IDX];
            parsedFrame.ToAddr = (this.readBuffer[UMBFRAME_TO_ADDR_IDX+1] << 8) | this.readBuffer[UMBFRAME_TO_ADDR_IDX];
            parsedFrame.cmd = this.readBuffer[UMBFRAME_CMD_IDX];
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
        }
        
        let retval = {
            parserState: this.parserState,
            umbframe: parsedFrame
        }

        return retval;
    }
    
}

module.exports.UMBParser = UMBParser;