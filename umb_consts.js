
//! @name  UMB frame character position (index)
//! UMB frame layout
//!
//!  0  |   1     |  2-3   | 4-5      | 6       | 7   |   8     |   9      | 10 - (7+len) | 8+len | (9+len) - (10+len) | 11+len
//! --- | ------- | ------ | -------- | ------- | --- | ------- | -------- | ------------ | ----- | ------------------ | ------
//! SOH | \<ver\> | \<to\> | \<from\> | \<len\> | STX | \<cmd\> | \<verc\> | \<payload\>  | ETX   | \<cs\>             | EOT
//!
//@{
const UMBFRAME_IDX = {
    SOH              :  0,    //!< Index of SOH in UMB frame buf
    VER              :  1,    //!< Frame index of frame version identifier
    FROM_ADDR        :  4,    //!< Frame index of destination address
    TO_ADDR          :  2,    //!< Frame index of destination address
    STX              :  7,    //!< Frame index for StartOfTXData identifier
    LEN              :  6,    //!< Frame length field frame index
    CMD              :  8,    //!< Command field frame index
    CMDV             :  9,    //!< Command version field frame index
    SUBCMD           :  10,   //!< SubCommand field frame index
    RES_STATUS       :  10,   //!< The first byte of payload data defines the status of a response
    RES_SUBCMD       :  11,   //!< SubCommand field frame index
    REQ_SUBCMD       :  10,   //!< SubCommand field frame index
}

const UMBFRAME_VAL = {
    SOH              :  0x01, //!< Start of Header
    STX              :  0x02, //!< StartOfTXData identifier value
    ETX              :  0x03, //!< End of TXData
    EOT              :  0x04, //!< End of transmission
}

//@}
const UMBFRAME_VERSION_V10          = 0x10;
const UMBFRAME_MAX_FRAMELENGTH      = 255;
const UMBFRAME_FRAME_LENGTH_OVERHEAD = 12;
const UMBFRAME_MAX_PAYLOAD_LENGTH   = (UMBFRAME_MAX_FRAMELENGTH - UMBFRAME_FRAME_LENGTH_OVERHEAD - 2 - 2);
const UMBFRAME_MAX_LENGTH           = (UMBFRAME_MAX_FRAMELENGTH - UMBFRAME_FRAME_LENGTH_OVERHEAD - 2);

const UMB_CMD = {
    GET_HWSW_VERSION : 0x20,
    E2_WRITE : 0x22,
    E2_READ : 0x21,
    RESET : 0x25,
    GETCHANNEL : 0x23,
    STATUS : 0x26,
    TIME_SET : 0x27,
    TIME_GET : 0x28,
    TEST : 0x29,
    MONITOR : 0x2A,
    SET_PROTOCOL : 0x2B,
    GET_LASTSTATUS : 0x2C,
    GETDEVINFO : 0x2D,
    RESET_DELAY : 0x2E,
    GETMULTICHANNEL : 0x2F,
    SET_NEW_DEVICE_ID : 0x30,

    TUNNEL : 0x36,
    FWUPDATE : 0x37,
    BINDATA : 0x38,
}

const UMB_CMDVER = {
    V10 : 0x10,
    V11 : 0x11,
} 

const UMB_SUMBCMD = {
    NONE : 0,
    FWUPDATE_INIT : 0x01,
    FWUPDATE_GET_STATUS : 0x02,
    FWUPDATE_TX : 0x10,
    TEST_ADJ_START : 0x10,
    TEST_ADJ_STOP : 0x11,
    TEST_ADJ_DEFAULTS : 0x12,
    TEST_EXT_START : 0x13,
    TEST_EXT_STOP : 0x14,
    TEST_GET_TOTAL_ADJ_STATUS : 0x15,
    TEST_PORT_READ              : 0x22,
    TEST_PORT_WRITE             : 0x23,
    BINDATA_BLOCKLEN : 0x10,
    BINDATA_OBJINFO : 0x11,
    BINDATA_OBJLOCK : 0x12,
    BINDATA_OBJUNLOCK : 0x13,
    BINDATA_OBJCRC : 0x14,
    BINDATA_OBJRX : 0x20,
    BINDATA_OBJTX : 0x30,
    GETDEVINFO_DEVNAME : 0x10,
    GETDEVINFO_DESCRIPTION : 0x11,
    GETDEVINFO_HWSW_VERSION : 0x12,
    GETDEVINFO_EXTINFO : 0x13,
    GETDEVINFO_EESIZE : 0x14,
    GETDEVINFO_GET_CH_NUM : 0x15,
    GETDEVINFO_GET_CH : 0x16,
    GETDEVINFO_EXT_VER_NUM : 0x17,
    GETDEVINFO_EXT_VER_INFO : 0x18,
    GETDEVINFO_GET_CH_NAME : 0x20,
    GETDEVINFO_GET_CH_RANGE : 0x21,
    GETDEVINFO_GET_CH_UNIT : 0x22,
    GETDEVINFO_GET_CH_DATATYPE : 0x23,
    GETDEVINFO_GET_CH_TYPE : 0x24,
    GETDEVINFO_GET_CH_INFO : 0x30,
    GETDEVINFO_GET_IP_NUM : 0x40,
    GETDEVINFO_GET_IP_INFO : 0x41,
}

module.exports.umb_consts = {
    UMBFRAME_VAL,
    UMBFRAME_IDX,
    UMBFRAME_VERSION_V10,
    UMBFRAME_MAX_FRAMELENGTH,
    UMBFRAME_MAX_PAYLOAD_LENGTH,
    UMBFRAME_MAX_LENGTH,
    UMB_CMD,
    UMB_CMDVER,
    UMB_SUMBCMD
}
