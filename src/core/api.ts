import {NewsFeed, NewsDetail} from '../types'

export class Api {
    xhr: XMLHttpRequest;
    url: string;

    constructor(url: string){
        this.xhr = new XMLHttpRequest;
        this.url = url;
    }
    
    getRequestWithXHR<xhrResponse>(cb: (data: xhrResponse) => void): void { // protected 생성자 안의 함수로 바깥에서 호출되지않게
        this.xhr.open('GET', this.url);
        this.xhr.addEventListener('load', () => {
            cb(JSON.parse(this.xhr.response) as xhrResponse);
        });
        this.xhr.send();
    }

    getRequestWithPromise<xhrResponse>(cb: (data: xhrResponse) => void): void { // protected 생성자 안의 함수로 바깥에서 호출되지않게
        fetch(this.url)
            .then(response => response.json())
            .then(cb)
            .catch(()=>{
                console.error('데이터를 불러오지 못했습니다.');
            });
    }

}

export class NewsFeedApi extends Api{
    constructor(url: string){
        super(url);
    }

    getDataWithXHR(cb: (data: NewsFeed[]) => void): void {
        return this.getRequestWithXHR<NewsFeed[]>(cb);
    }

    getDataWithPromise(cb: (data: NewsFeed[]) => void): void {
        return this.getRequestWithPromise<NewsFeed[]>(cb);
    }
}

export class NewsDetailApi extends Api{
    constructor(url: string){
        super(url);
    }
    getDataWithXHR(cb: (data: NewsDetail) => void): void {
        return this.getRequestWithXHR<NewsDetail>(cb);
    }

    getDataWithPromise(cb: (data: NewsDetail) => void): void {
        return this.getRequestWithPromise<NewsDetail>(cb);
    }
}

// function applyApiMixins(targetClas: any, baseClass: any[]): void{
//     baseClass.forEach(baseClass => {
//         Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
//             const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

//             if(descriptor){
//                 Object.defineProperty(targetClas.prototype, name, descriptor);
//             }
//         });
//     });
// }
// applyApiMixins(NewsFeedApi, [Api]);
// applyApiMixins(NewsDetailApi, [Api]);

