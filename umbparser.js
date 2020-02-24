
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

const crc8EEH210FastTable =
[
    0x00, 0x31, 0x62, 0x53, 0xC4, 0xF5, 0xA6, 0x97, 0xB9, 0x88, 0xDB, 0xEA, 0x7D, 0x4C, 0x1F, 0x2E,
    0x43, 0x72, 0x21, 0x10, 0x87, 0xB6, 0xE5, 0xD4, 0xFA, 0xCB, 0x98, 0xA9, 0x3E, 0x0F, 0x5C, 0x6D,
    0x86, 0xB7, 0xE4, 0xD5, 0x42, 0x73, 0x20, 0x11, 0x3F, 0x0E, 0x5D, 0x6C, 0xFB, 0xCA, 0x99, 0xA8,
    0xC5, 0xF4, 0xA7, 0x96, 0x01, 0x30, 0x63, 0x52, 0x7C, 0x4D, 0x1E, 0x2F, 0xB8, 0x89, 0xDA, 0xEB,
    0x3D, 0x0C, 0x5F, 0x6E, 0xF9, 0xC8, 0x9B, 0xAA, 0x84, 0xB5, 0xE6, 0xD7, 0x40, 0x71, 0x22, 0x13,
    0x7E, 0x4F, 0x1C, 0x2D, 0xBA, 0x8B, 0xD8, 0xE9, 0xC7, 0xF6, 0xA5, 0x94, 0x03, 0x32, 0x61, 0x50,
    0xBB, 0x8A, 0xD9, 0xE8, 0x7F, 0x4E, 0x1D, 0x2C, 0x02, 0x33, 0x60, 0x51, 0xC6, 0xF7, 0xA4, 0x95,
    0xF8, 0xC9, 0x9A, 0xAB, 0x3C, 0x0D, 0x5E, 0x6F, 0x41, 0x70, 0x23, 0x12, 0x85, 0xB4, 0xE7, 0xD6,
    0x7A, 0x4B, 0x18, 0x29, 0xBE, 0x8F, 0xDC, 0xED, 0xC3, 0xF2, 0xA1, 0x90, 0x07, 0x36, 0x65, 0x54,
    0x39, 0x08, 0x5B, 0x6A, 0xFD, 0xCC, 0x9F, 0xAE, 0x80, 0xB1, 0xE2, 0xD3, 0x44, 0x75, 0x26, 0x17,
    0xFC, 0xCD, 0x9E, 0xAF, 0x38, 0x09, 0x5A, 0x6B, 0x45, 0x74, 0x27, 0x16, 0x81, 0xB0, 0xE3, 0xD2,
    0xBF, 0x8E, 0xDD, 0xEC, 0x7B, 0x4A, 0x19, 0x28, 0x06, 0x37, 0x64, 0x55, 0xC2, 0xF3, 0xA0, 0x91,
    0x47, 0x76, 0x25, 0x14, 0x83, 0xB2, 0xE1, 0xD0, 0xFE, 0xCF, 0x9C, 0xAD, 0x3A, 0x0B, 0x58, 0x69,
    0x04, 0x35, 0x66, 0x57, 0xC0, 0xF1, 0xA2, 0x93, 0xBD, 0x8C, 0xDF, 0xEE, 0x79, 0x48, 0x1B, 0x2A,
    0xC1, 0xF0, 0xA3, 0x92, 0x05, 0x34, 0x67, 0x56, 0x78, 0x49, 0x1A, 0x2B, 0xBC, 0x8D, 0xDE, 0xEF,
    0x82, 0xB3, 0xE0, 0xD1, 0x46, 0x77, 0x24, 0x15, 0x3B, 0x0A, 0x59, 0x68, 0xFF, 0xCE, 0x9D, 0xAC
];

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
        this.payloadCnt = 0;
        this.frameState = FRAME_STATE.PAR_SOH;
        this.parserState = PAR_STATE.PARSER_PROCESSING;
        this.payload = [];
    }

    static calcCRC(data)
    {
        let crc = 0xFF;
        for(let i=0; i<data.length; i++)
        {
            crc = crc8EEH210FastTable[crc ^ data[i]];
        }
        
        return crc;
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
            parsedFrame.payload = this.payload;
            parsedFrame.crc = UMBParser.calcCRC(this.readBuffer.slice(0, this.parsingETXIdx));
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