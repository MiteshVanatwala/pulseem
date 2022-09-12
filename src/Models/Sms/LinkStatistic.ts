interface ILinkStatistic {
    LinkID: number;
    Url: string;
    UniqueClicks: number;
    TotalClicks: number;
    OpenCount: string;
}
// class LinkStatistic implements ILinkStatistic {
//     constructor(OpenCount: string, UniqueClicks: number, TotalClicks: number, LinkID: number, Url: string) {
//         UniqueClicks = UniqueClicks;
//         TotalClicks = TotalClicks;
//         LinkID = LinkID;
//         Url = Url;
//         OpenCount = `${UniqueClicks} / ${TotalClicks}`;
//     }
// }