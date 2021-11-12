import {NewsFeed, NewsDetail} from '../types'

export class Api {
    ajax: XMLHttpRequest;
    url: string;

    constructor(url: string){
        this.ajax = new XMLHttpRequest;
        this.url = url;
    }
    
    getRequest<AjaxResponse>(cb: (data: AjaxResponse) => void): void { // protected 생성자 안의 함수로 바깥에서 호출되지않게
        this.ajax.open('GET', this.url);
        this.ajax.addEventListener('load', () => {
            cb(JSON.parse(this.ajax.response) as AjaxResponse);
        });
        this.ajax.send();
    }

}

export class NewsFeedApi extends Api{
    constructor(url: string){
        super(url);
    }

    getData(cb: (data: NewsFeed[]) => void): void {
        return this.getRequest<NewsFeed[]>(cb);
    }
}

export class NewsDetailApi extends Api{
    constructor(url: string){
        super(url);
    }
    getData(cb: (data: NewsDetail) => void): void {
        return this.getRequest<NewsDetail>(cb);
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

