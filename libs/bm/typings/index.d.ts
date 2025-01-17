
export { };
declare var window: Window;
declare global {
    interface Window {
        GS: any;
        nsParams:any;
        urlParams: { [key: string]: string };
        GSParent: {
            gatewayURL?: string;
        };
        gainsightTrackEvents: {
            pushEvents: (...arg: any[]) => void
        };
    }
}