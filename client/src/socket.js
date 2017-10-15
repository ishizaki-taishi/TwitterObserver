import io from 'socket.io-client';

const socket = io('http://localhost:3000', { transports: ['websocket'] });

export { socket };

/**
 * UID を取得する
 */
const uid = (() => {
    let id = 0;
    return () => id++;
})();


const bg = '#005cc5';

/**
 * WebSocket でリクエストを送り結果を受け取る
 * @param  {[type]} name WebSocket のイベント名
 * @param  {[type]} args 引数
 */
export function request(name, ...args) {

    // 既に登録されていたリスナーを削除する
    socket.off(name);

    return new Promise((resolve) => {

        // レスポンスを受け取るイベント名
        const responseName = name + uid();

        // 結果を受け取ったら resolve
        socket.on(responseName, (...args) => {

            console.log(`%c${name}`,
                `color:#fff;background:${bg};border:solid 3px ${bg};border-radius:.3rem`,
                ...args);

            resolve(...args);

        });

        socket.emit(name, responseName, ...args);

    });
}


export default socket;
