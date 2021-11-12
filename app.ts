//1. type alias -> 1. = {} 형식 2. 타입 결합시키는 방식 ( A & B = {})
//2. interface -> 1. 타입을 결합시키거나 조합시키는 방식이 다름 ( A extends B ) 2. 유니온 타입은 인터페이스를 사용 불가능
interface Store {
    currentPage: number;
    feeds: NewsFeed[];
}

interface News {
    readonly id: number; // 코드에서 id 수정 불가능 ( 서버에 id값이 있기때문에 바뀌면 호출하지 못할 수도 있는 경우 )
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

interface NewsFeed extends News {
    readonly comments_count: number;
    readonly points: number;
    read?: boolean; // ?: -> optional
}

interface NewsDetail extends News {
    readonly comments: [];
}

interface NewsComment extends News {
    readonly comments: [];
    readonly level: number;
}

interface RouteInfo {
    path: string;
    page: View;
}

// const container: HTMLElement | null = document.getElementById('root');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'; // @id 바꿔치키

const content = document.createElement('div');
//const ul = document.createElement('ul');

let endFlag;

const store: Store = {
    currentPage : 1, // 최근 페이지
    feeds : [],
};

function applyApiMixins(targetClas: any, baseClass: any[]): void{
    baseClass.forEach(baseClass => {
        Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
            const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

            if(descriptor){
                Object.defineProperty(targetClas.prototype, name, descriptor);
            }
        });
    });
}

class Api {
    getRequest<AjaxResponse>(url: string): AjaxResponse { // protected 생성자 안의 함수로 바깥에서 호출되지않게
        const ajax = new XMLHttpRequest();
        ajax.open('GET', url, false);
        ajax.send();
        return JSON.parse(ajax.response);
    }

}

class NewsFeedApi{
    getData(): NewsFeed[] {
        return this.getRequest<NewsFeed[]>(NEWS_URL);
    }
}

class NewsDetailApi{
    getData(id: string): NewsDetail {
        return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id));
    }
}

interface NewsFeedApi extends Api {}; // this. 을 사용하기 위해서 알려주는 부분
interface NewsDetailApi extends Api {};

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);

// function getData<AjaxResponse>(url: string): AjaxResponse{
//     ajax.open('GET', url, false);
//     ajax.send();
//     return JSON.parse(ajax.response);
// }

abstract class View {
    private template: string;
    private renderTemplate: string;
    private container: HTMLElement;
    private htmlList: string[];

    constructor(containerId: string, template: string){
        const containerElement = document.getElementById(containerId);

        if(!containerElement){
            throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.';
        }

        this.container = containerElement;
        this.template = template;
        this.renderTemplate = template;
        this.htmlList = [];
    }

    protected updateView(): void{
        this.container.innerHTML = this.renderTemplate;
        this.renderTemplate = this.template;
    }

    protected addHtml(htmlString: string): void {
        this.htmlList.push(htmlString);
    }
    
    protected getHtml(): string{
        const snapshot = this.htmlList.join('');
        this.clearHtmlList();
        return snapshot;
    }
    
    protected setTemplateData(key: string, value: string): void{
        this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);

    }

    private clearHtmlList(): void {
        this.htmlList = [];
    }

    abstract render(): void; // 추상 메소드
 
}

class Router {
    routeTable: RouteInfo[];
    defaultRoute: RouteInfo | null;

    constructor(){
        
        
        window.addEventListener('hashchange', this.route.bind(this));
        
        this.routeTable = [];
        this.defaultRoute = null;
    }

    setDefaultPage(page: View): void {
        this.defaultRoute = {path: '', page};
    }

    addRoutePath(path: string, page: View): void{
        this.routeTable.push({ path, page });
    }

    route(){
        const routePath = location.hash;
        if(routePath === '' && this.defaultRoute){
            this.defaultRoute.page.render();
        }

        for(const routeInfo of this.routeTable){
            if(routePath.indexOf(routeInfo.path) >= 0){
                routeInfo.page.render();
                break;
            }
        }
    }
}

class NewsFeedView extends View {
    private api: NewsFeedApi;
    private feeds: NewsFeed[];

    constructor(conatinerId: string){
        let template: string = `
            <div class="bg-gray-600 min-h-screen">
                <div class="bg-white text-xl">
                    <div class="mx-auto px-4">
                        <div class="flex justify-between items-center py-6">
                            <div class="flex justify-start">
                                <h1 class="font-extrabold">Hacker News</h1>
                            </div>
                            <div class="items-center justify-end">
                                <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                                    Previous
                                </a>
                                <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                                    Next
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="p4 text-2xl text-gray-700">
                    {{__news_feed__}}
                </div>
            </div>
        `; // handlebars templates 적용해보기
        
        super(conatinerId, template); // 슈퍼클래스

        this.api = new NewsFeedApi();
        this.feeds = store.feeds;
    

        if(this.feeds.length === 0){
            this.feeds = store.feeds = this.api.getData(); // 두줄짜리 코드 한줄로
            this.makeFeeds();
        }
    }

    render():void {
        store.currentPage = Number(location.hash.substr(7) || 1);
        // for 문 내부 i 는 타입 추론으로 자동으로 number형으로 인식 
        for(let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++){
            const {id, title, comments_count, user, points, time_ago, read} = this.feeds[i]; //구조분해할당 -> ES5 이후 추가된 많이쓰이는 문법
            //const div = document.createElement('div');
            this.addHtml(`
                <div class="p-6 ${read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hober:bg-green-100">
                    <div class="flex">
                        <div class="flex-auto">
                            <a href = #/show/${id}>${title}</a>
                        </div>
                        <div>
                            <div class="text-center text-sm">${comments_count}</div>
                        </div>
                    </div>
                    <div class="flex mt-3">
                        <div class="grid grid-cols-3 text-sm text-gray-500">
                            <div><i class="fas fa-user mr-1"></i>${user}</div>
                            <div><i class="fas fa-heart mr-1"></i>${points}</div>
                            <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
                        </div>
                    </div>
                </div>
            `);
        }
        
        this.setTemplateData('news_feed', this.getHtml()); //container.innerHTML = newsList.join(''); // 조인 사용시 배열안의 문자열들을 합쳐서 반환해준다, 배열 인덱스 사이의 구분자(default = ,)가 존재하기때문에 없애줘야하는데,, join 함수의 첫번째 파라미터는 구분자를 어떤것을 사용할지 정하는 부분. 그렇기때문에 '' 라는 공백을 넣으면 문자열만을 반환해준다.
        this.setTemplateData('prev_page', String(store.currentPage > 1 ? store.currentPage -1 : 1));
        this.setTemplateData('next_page', String(store.currentPage + 1));

        this.updateView();
    }

    private makeFeeds(): void{
        for(let i = 0; i < this.feeds.length; i++){
            this.feeds[i].read = false; 
        }
    }

}

class NewsDetailView extends View {
    constructor(containerId: string){
        
        let template = `
            <div class="bg-gray-600 min-h-screen pb-8">
                <div class="bg-white text-xl">
                    <div class="mx-auto px-4">
                        <div class="flex justify-between items-center py-6">
                            <div class="flex justify-start">
                                <h1 class="font-extrabold">Hacker News</h1>
                            </div>
                            <div class="items-center justify-end">
                                <a href="#/page/{{__currentPage__}}" class="text-gray-500">
                                    <i class="fa fa-times"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="h-full border rounded-xl bg-white m-6 b-4">
                    <h2>{{__title__}}</h2>
                    <div class="text-gray-400 h-20">
                        {{__content__}}
                    </div>

                    {{__comments__}}

                </div>
            </div>
        `;
        
        super(containerId, template);
    }

    render():void {
        //console.log(location.hash); //id가져오기 (브라우저가 기본으로 제공해주는 객체)
        const id = location.hash.substr(7);
        const api = new NewsDetailApi();
        const newsDetail: NewsDetail = api.getData(id);

        for(let i = 0; i < store.feeds.length; i++){
            if (store.feeds[i].id === Number(id)){
                store.feeds[i].read = true;
                break;
            }
        }
        
        this.setTemplateData('comments', this.makeComment(newsDetail.comments));
        this.setTemplateData('currentPage', String(store.currentPage));
        this.setTemplateData('title', newsDetail.title);
        this.setTemplateData('content', newsDetail.content);

        
        this.updateView();

    }

    private makeComment(comments: NewsComment[]): string{   
    
        for(let i = 0; i < comments.length; i++){
            const comment: NewsComment = comments[i];
            this.addHtml(`
                <div style="padding-left : ${comment.level * 40}px;" class="mt-4">
                    <div class="text-gray-400">
                        <i class="fa fa-sort-up mr-2"></i>
                        <strong>${comment.user}</strong> ${comment.time_ago}
                    </div>
                    <p class="text-gray-700">${comment.content}</p>
                </div>
            `);
            if(comment.comments.length > 0){
                this.addHtml(this.makeComment(comment.comments));
            }
        }
    
        return this.getHtml();
    }

}


const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();