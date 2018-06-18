//@ts-check

import * as request from "request";
import * as zlib from "zlib";
import * as numeral from "numeral";

export async function getWebPage(url, method, postData, headers) {
  method = method || "GET";
  if (method !== "GET" && method !== "POST") {
    throw new Error("method not supported");
  }
  return new Promise((resolve, reject) => {
    let req;
    if (method === "POST") {
      req = request.post(url, {
        body: postData,
        headers: headers
      });
    } else {
      req = request(url);
    }
    req.on("response", function (res) {
      const chunks = [];

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        const buffer = Buffer.concat(chunks);
        const encoding = res.headers["content-encoding"];
        if (encoding === "gzip") {
          zlib.gunzip(buffer, function (err, decoded) {
            resolve(decoded && decoded.toString());
          });
        } else if (encoding === "deflate") {
          zlib.inflateRaw(buffer, function (err, decoded) {
            if (err) {
              return reject(err);
            }
            resolve(decoded && decoded.toString());
          });
        } else {
          resolve(buffer.toString());
        }
      });
    });

    req.on("error", function (err) {
      reject(err);
    });
  });
}

export function formatCurrency(amount) {
  return numeral(amount)
    .format('0,0.00')
    .replace(/,/g, '')
    .replace(/\./g, ',');
}