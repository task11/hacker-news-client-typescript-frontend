import Router from "./core/router";
import {NewsDetailView, NewsFeedView} from './page';
import Store from "./store";

// const container: HTMLElement | null = document.getElementById('root');
//const ajax: XMLHttpRequest = new XMLHttpRequest();
//const content = document.createElement('div');
//const ul = document.createElement('ul');
//let endFlag;



//윈도우에 전역변수로 저장하는 임시방법(좋지않음)
// const store: Store = {
//     currentPage : 1, // 최근 페이지
//     feeds : [],
// };

// declare global {
//     interface Window {
//         store: Store;
//     }
// }  

// window.store = store;


// function getData<AjaxResponse>(url: string): AjaxResponse{
//     ajax.open('GET', url, false);
//     ajax.send();
//     return JSON.parse(ajax.response);
// }

const store = new Store();

const router: Router = new Router();
const newsFeedView = new NewsFeedView('root', store);
const newsDetailView = new NewsDetailView('root', store);

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();