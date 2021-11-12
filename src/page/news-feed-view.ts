import View from "../core/view";
import { NewsFeedApi } from "../core/api";
import { NewsFeed, NewsStore } from "../types";
import { NEWS_URL } from "../config";
const template: string = `
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

export default class NewsFeedView extends View {
    private api: NewsFeedApi;
    private store: NewsStore;

    constructor(conatinerId: string, store: NewsStore){
        
        
        super(conatinerId, template); // 슈퍼클래스

        this.store = store;
        this.api = new NewsFeedApi(NEWS_URL);
    

        
    }

    render():void {
        this.store.currentPage = Number(location.hash.substr(7) || 1);

        if(!this.store.hasFeeds){
            this.api.getDataWithPromise((feeds: NewsFeed[]) => {
                this.store.setFeeds(feeds);
                this.renderview();
            })
            // this.feeds = window.store.feeds = this.api.getData(); // 두줄짜리 코드 한줄로
            // this.makeFeeds();
        }

        this.renderview();
    }


    renderview = (page: string = '1'): void => {
        // for 문 내부 i 는 타입 추론으로 자동으로 number형으로 인식 
        for(let i = (this.store.currentPage - 1) * 10; i < this.store.currentPage * 10; i++){
            const {id, title, comments_count, user, points, time_ago, read} = this.store.getFeed(i); //구조분해할당 -> ES5 이후 추가된 많이쓰이는 문법
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
        this.setTemplateData('prev_page', String(this.store.prevPage));
        this.setTemplateData('next_page', String(this.store.nextPage));

        this.updateView();
    }
}