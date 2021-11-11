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

const container: HTMLElement | null = document.getElementById('root');
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
interface NewsFeedApi extends Api {};
interface NewsDetailApi extends Api {};

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);

// function getData<AjaxResponse>(url: string): AjaxResponse{
//     ajax.open('GET', url, false);
//     ajax.send();
//     return JSON.parse(ajax.response);
// }

function makeFeeds(feeds: NewsFeed[]): NewsFeed[]{
    for(let i = 0; i < feeds.length; i++){
        feeds[i].read = false; 
    }

    return feeds;
}

function updateView(html: string): void{
    if(container != null){
        container.innerHTML = html;
    }else{
        console.error('최상위 컨테이너가 없어 UI를 진행하지 못합니다.');
    }  

}

function newsFeed(): void{
    const api = new NewsFeedApi();
    let newsFeed: NewsFeed[] = store.feeds;
    const newsList = [];
    let template = `
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

    if(newsFeed.length === 0){
       newsFeed = store.feeds = makeFeeds(api.getData()); // 두줄짜리 코드 한줄로
    }
    // for 문 내부 i 는 타입 추론으로 자동으로 number형으로 인식 
    for(let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++){
        //const div = document.createElement('div');
        

        newsList.push(`
            <div class="p-6 ${newsFeed[i].read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hober:bg-green-100">
                <div class="flex">
                    <div class="flex-auto">
                        <a href = #/show/${newsFeed[i].id}>${newsFeed[i].title}</a>
                    </div>
                    <div>
                        <div class="text-center text-sm">${newsFeed[i].comments_count}</div>
                    </div>
                </div>
                <div class="flex mt-3">
                    <div class="grid grid-cols-3 text-sm text-gray-500">
                        <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
                        <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
                        <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
                    </div>
                </div>
            </div>
        `);
    }

    
    template = template.replace('{{__news_feed__}}', newsList.join('')); //container.innerHTML = newsList.join(''); // 조인 사용시 배열안의 문자열들을 합쳐서 반환해준다, 배열 인덱스 사이의 구분자(default = ,)가 존재하기때문에 없애줘야하는데,, join 함수의 첫번째 파라미터는 구분자를 어떤것을 사용할지 정하는 부분. 그렇기때문에 '' 라는 공백을 넣으면 문자열만을 반환해준다.
    template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage -1 : 1));
    template = template.replace('{{__next_page__}}', String(store.currentPage + 1));

    updateView(template);
    
}


function newsDetail(): void{
    //console.log(location.hash); //id가져오기 (브라우저가 기본으로 제공해주는 객체)
    const id = location.hash.substr(7);
    const api = new NewsDetailApi();
    const newsContent: NewsDetail = api.getData(id);
    let template = `
        <div class="bg-gray-600 min-h-screen pb-8">
            <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex justify-start">
                            <h1 class="font-extrabold">Hacker News</h1>
                        </div>
                        <div class="items-center justify-end">
                            <a href="#/page/${store.currentPage}" class="text-gray-500">
                                <i class="fa fa-times"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="h-full border rounded-xl bg-white m-6 b-4">
                <h2>${newsContent.title}</h2>
                <div class="text-gray-400 h-20">
                    ${newsContent.content}
                </div>

                {{__comments__}}

            </div>
        </div>
    `;

    for(let i = 0; i < store.feeds.length; i++){
        if (store.feeds[i].id === Number(id)){
            store.feeds[i].read = true;
            break;
        }
    }
  
    updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}

function makeComment(comments: NewsComment[]): string{
    const commentString =[];

    for(let i = 0; i < comments.length; i++){
        const comment: NewsComment = comments[i];
        commentString.push(`
            <div style="padding-left : ${comment.level * 40}px;" class="mt-4">
                <div class="text-gray-400">
                    <i class="fa fa-sort-up mr-2"></i>
                    <strong>${comment.user}</strong> ${comment.time_ago}
                </div>
                <p class="text-gray-700">${comment.content}</p>
            </div>
        `);
        if(comment.comments.length > 0){
            commentString.push(makeComment(comment.comments));
        }
    }

    return commentString.join('');
}

function router(): void{
    const routePath = location.hash; 

    if(routePath === ''){// location 해쉬에 #이 들어오면 빈 값 반환이 되어 조건문이 동작하는 것
        newsFeed();
    } else if (routePath.indexOf('#/page/') >= 0) { // 문자열 값 안에 존재하면 위치정보, 없으면 -1
        store.currentPage = Number(routePath.substr(7));
        newsFeed();
    } else {
        newsDetail();
    }
}

window.addEventListener('hashchange', router);

router();

