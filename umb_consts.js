
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

module.exports.umb_consts = {
    UMBFRAME_VAL,
    UMBFRAME_IDX,
    UMBFRAME_VERSION_V10,
    UMBFRAME_MAX_FRAMELENGTH,
    UMBFRAME_MAX_PAYLOAD_LENGTH,
    UMBFRAME_MAX_LENGTH
}
//module.exports.UMBFRAME_IDX = UMBFRAME_IDX;
