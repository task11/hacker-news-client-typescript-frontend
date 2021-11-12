import {NewsFeed, NewsDetail} from '../types'

export class Api {
    ajax: XMLHttpRequest;
    url: string;

    constructor(url: string){
        this.ajax = new XMLHttpRequest;
        this.url = url;
    }
    
    getRequest<AjaxResponse>(): AjaxResponse { // protected 생성자 안의 함수로 바깥에서 호출되지않게
        this.ajax.open('GET', this.url, false);
        this.ajax.send();
    
        return JSON.parse(this.ajax.response);
    }

}

export class NewsFeedApi extends Api{
    getData(): NewsFeed[] {
        return this.getRequest<NewsFeed[]>();
    }
}

export class NewsDetailApi extends Api{
    getData(id: string): NewsDetail {
        return this.getRequest<NewsDetail>();
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

