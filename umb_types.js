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

