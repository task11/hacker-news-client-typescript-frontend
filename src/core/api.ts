import {NewsFeed, NewsDetail, News} from '../types'

export class Api {
    xhr: XMLHttpRequest;
    url: string;

    constructor(url: string){
        this.xhr = new XMLHttpRequest;
        this.url = url;
    }

    async request<AjaxResponse>(): Promise<AjaxResponse> { // protected 생성자 안의 함수로 바깥에서 호출되지않게
        const response = await fetch(this.url);
        return await response.json() as AjaxResponse;
            // .then(response => response.json())
            // .then(cb)
            // .catch(()=>{
            //     console.error('데이터를 불러오지 못했습니다.');
            // });
    }

}

export class NewsFeedApi extends Api{
    constructor(url: string){
        super(url);
    }

    getData(): Promise<NewsFeed[]> {
        return this.request<NewsFeed[]>();
    }
}

export class NewsDetailApi extends Api{
    constructor(url: string){
        super(url);
    }

    getData(): Promise<NewsDetail> {
        return this.request<NewsDetail>();
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

