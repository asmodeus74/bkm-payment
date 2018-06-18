This a simple BKM payment consumer library
I wrote it for myself for a quick project

Usage:

```javascript
const pemPath = path.resolve('myfolder/mypemfile.pem');
const orderId = '<create a unique id here..>';
const successUrl = `http://<myhostname>/bkm-success/${orderId}`;
const cancelUrl = `http://<myhostname>/bkm-cancel/${orderId}`;
const amount = formatCurrency(10);
const req = {
    mId: '<BKM ID of your merchant>',
    sUrl: successUrl,
    cUrl: cancelUrl,
    sAmount: amountString,
    cAmount: '0,00',
    msUrl: '',
    mcUrl: '',
    rSource: '',
    dType: '',
    osSource: '',
    uAgent: '',
    orderId,
    instOpts: [
        {
            id: '0062',
            name: 'Garanti',
            expBank: 'Aciklama',
            bins: [
                {
                    value: '9999',
                    insts: [
                        {
                            nofInst: '1',
                            amountInst: amount,
                            cAmount: '0,00',
                            tAmount: amount,
                            cPaid1stInst: 'false',
                            expInst: 'Taksitsiz'
                        }
                    ]
                }
            ]
        }
    ],
    ts: getTimestamp()
};
const op = new InitializePayment(pemPath);
const result = await op.init(request);
```

Use it as it is

License
----
The MIT License (MIT)

Copyright (c) 2018 Murat Demircioglu

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
