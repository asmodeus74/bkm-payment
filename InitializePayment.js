//@ts-check

import * as fs from "fs";
import * as moment from "moment";
import * as ursa from "ursa";
import {
  getWebPage
} from "./helpers";
const X2JS = require("x2js");

export default class InitializePayment {
  pemPath = null;
  endPoint = null;

  constructor(pemPath, endPoint) {
    this.pemPath = pemPath;
    this.endPoint = endPoint || 'https://preprod.bkmexpress.com.tr:9620/BKMExpress/BkmExpressPaymentService.ws';
  }

  pushPropsToXml(xml, obj, n) {
    for (const key of Object.getOwnPropertyNames(obj)) {
      if (typeof obj[key] == 'object') continue;
      const ns = n ? ' ' + n : '';
      xml.push(`<${key}${ns}>${obj[key]}</${key}>`);
    }
  }

  prepareHash(req) {
    let data = `${req.mId}${req.sUrl}${req.cUrl}${req.sAmount}${req.cAmount}${req.msUrl}${req.mcUrl}${req.rSource}${req.dType}${req.osSource}${req.uAgent}${req.orderId}`;
    for (const bank of req.instOpts) {
      data += `${bank.id}${bank.name}${bank.expBank}`;
      for (const bin of bank.bins) {
        data += `${bin.value}`;
        for (const i of bin.insts) {
          data += `${i.nofInst}${i.amountInst}${i.cAmount}${i.tAmount}${i.cPaid1stInst}${i.expInst}`;
        }
      }
    }
    data += req.ts;
    return data;
  }

  loadKeyFile() {
    return fs.readFileSync(this.pemPath, {
      encoding: "utf8"
    });
  }

  sign(data, key) {
    var openssl = ursa.coerceKey(key);
    try {
      return openssl.hashAndSign("sha256", data, 'utf8', 'base64');
    } catch (e) {
      return false;
    }
  }

  signHash(req) {
    const privateKey = this.loadKeyFile();
    return this.sign(this.prepareHash(req), privateKey);
  }

  signString(s) {
    const privateKey = this.loadKeyFile();
    return this.sign(s, privateKey);
  }

  buildXmlRequest(req) {
    const xml = [];
    xml.push('<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">');
    xml.push('<s:Body>');
    xml.push('<initializePayment xmlns="http://www.bkmexpress.com.tr">')
    xml.push('<initializePaymentWSRequest>');

    req.ts = moment().format("YYYYMMDD-HH:mm:ss");
    req.s = this.signHash(req);

    this.pushPropsToXml(xml, req, 'xmlns=""');

    xml.push('<instOpts xmlns="">');
    for (const bank of req.instOpts) {
      xml.push('<bank>');
      this.pushPropsToXml(xml, bank);
      xml.push('<bins>');
      for (const bin of bank.bins) {
        xml.push('<bin>');
        xml.push(`<value>${bin.value}</value>`);
        xml.push('<insts>');
        for (const inst of bin.insts) {
          xml.push('<inst>');
          this.pushPropsToXml(xml, inst);
          xml.push('</inst>');
        }
        xml.push('</insts>');
        xml.push('</bin>');
      }
      xml.push('</bins>');
      xml.push('</bank>');
    }
    xml.push('</instOpts>');

    xml.push('</initializePaymentWSRequest>');
    xml.push('</initializePayment>');
    xml.push('</s:Body>');
    xml.push('</s:Envelope>');

    return xml.join('\n');
  }

  _getProp(data, n) {
    return data[n] && data[n]["__text"] ?
      data[n]["__text"] :
      '';
  }

  init(req) {
    const getProp = this._getProp;
    const xml = this.buildXmlRequest(req);
    return getWebPage(this.endPoint, "POST", xml).then(
      function (xml) {
        const x2 = new X2JS();
        const doc = x2.xml2js(xml);
        const result = doc.Envelope.Body.initializePaymentResponse.initializePaymentWSResponse;
        result.t = getProp(result, "t");
        result.url = getProp(result, "url");
        result.ts = getProp(result, "ts");
        result.s = getProp(result, "s");
        return Promise.resolve(result);
      },
      function (error) {
        return Promise.reject(error);
      }
    );
  }
}