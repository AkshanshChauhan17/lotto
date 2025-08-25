import { QRCodeCanvas } from "qrcode.react";
import { BsPrinterFill } from "react-icons/bs";

export default function QrCodeExample({data, oc}) {
  return (
    <div className="qr">
      <QRCodeCanvas 
        value={data} 
        size={100}       // size in px
        level="L"        // error correction level (L, M, Q, H)
        includeMargin={true}
      />
      <button className="print-button" style={{padding: "2px 20px"}} onClick={()=>oc()}><BsPrinterFill />Print</button>
    </div>
  );
}