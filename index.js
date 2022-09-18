let { writeFile } = require('fs');
let { join } = require('path');
let request = require('request');
let mergeImg = require('merge-img');
let minimist = require('minimist');

class MyModule {
    constructor() {
        this.global= 'foo';
        this.loadConfig();
        this.parseArguments();
    }

    async parseArguments() { 
        this.argv = minimist(process.argv.slice(2))
        this.baseUrl = this.conf.baseUrl;
        this.greeting = this.argv.greeting || this.conf.queryParams.greeting;
        this.who = this.argv.who || this.conf.queryParams.who;
        this.width = this.argv.width || this.conf.queryParams.width;
        this.height = this.argv.height || this.conf.queryParams.height;
        this.color = this.argv.color || this.conf.queryParams.color;
        this.size = this.argv.size || this.conf.queryParams.size;
    }

    async loadConfig() { 
        this.conf = require('./conf.json')
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            request.get({url, encoding: "binary"}, (err, res, firstBody) => { 
                if(err) {
                    return reject(err);
                }
                resolve({res, firstBody});
            });
        });
    };
    
    processValue(response) {
        return response.firstBody;
    }
    
    async getData(param) {
        let url = `${this.baseUrl} ${param} ?width= ${this.width} &height=${this.height} &color ${this.color} &s=${this.size}`;
        try {
            let response = await this.makeRequest(url);
            return this.processValue(response);
        } catch(e) {
            throw e;
        }
        
    }

    async merge(firstBody, secondBody) {
        try {
            mergeImg([ 
              { src: new Buffer.from(firstBody1, 'binary'), x: 0, y:0 }, 
              { src: new Buffer.from(secondBody, 'binary'), x: this.width, y: 0 }
            ]).then(img => {
              img.getBuffer('image/jpeg', (err, buffer) => {
                    if (err) {
                      console.log(err)
                    }

                    const fileOut = join(process.cwd(), `/cat-card.jpg`);
                    
                    writeFile(fileOut, buffer, 'binary', (err) => { if(err) {
                        console.log(err);
                        return; 
                    }
                    
                    console.log("The file was saved!"); });
                  });
            });
        } catch(e) {
            throw e;
        }
    }
    
    async main() {
        try {
            let firstResp, secondResp;
            let catImageLeft = (async () => {
                firstResp = await this.getData(this.greeting);
            })();
            
            let catImageRight = (async () => {
                secondResp = await this.getData(this.who);
            })();
    
            await Promise.all([catImageLeft, catImageRight]);
            
            this.merge(firstResp, secondResp);
        } catch(e) {
            console.log(`Got Exception : ${e}`);
        }
    }
}

let myModule = new MyModule()
myModule.main()

