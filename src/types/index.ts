import View from "../core/view";

//1. type alias -> 1. = {} 형식 2. 타입 결합시키는 방식 ( A & B = {})
//2. interface -> 1. 타입을 결합시키거나 조합시키는 방식이 다름 ( A extends B ) 2. 유니온 타입은 인터페이스를 사용 불가능
export interface Store {
    currentPage: number;
    feeds: NewsFeed[];
}

export interface News {
    readonly id: number; // 코드에서 id 수정 불가능 ( 서버에 id값이 있기때문에 바뀌면 호출하지 못할 수도 있는 경우 )
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

export interface NewsFeed extends News {
    readonly comments_count: number;
    readonly points: number;
    read?: boolean; // ?: -> optional
}

export interface NewsDetail extends News {
    readonly comments: [];
}

export interface NewsComment extends News {
    readonly comments: [];
    readonly level: number;
}

export interface RouteInfo {
    path: string;
    page: View;
}
