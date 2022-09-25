const { fetch: originalFetch } = window;
const serverURL = 'http://localhost:3001';

const toggleWindow = (e, target) => {
  //prevent toggling of display if click event on child div
  if (e.target !== e.currentTarget) return;

  target.style.display === 'none'
    ? (target.style.display = 'block')
    : (target.style.display = 'none');
};

const body = document.body;

const btn = document.createElement('button');

const bg = document.createElement('div');

bg.style.cssText = `
  display: none;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 999;
  `;

btn.style.cssText = `
  position: fixed;
  background-color: rgb(0, 0, 0);
  height: 50px;
  width: 50px;
  border-radius: 50%;
  z-index: 99;
  bottom: 70px;
  right: 20px;
  color: #fff;
  font-size: 10px;
  text-align: center;
  `;

btn.textContent = 'Open';

const frame = document.createElement('iframe');
frame.src = serverURL;
frame.id = 'data-frame';
frame.style.cssText = `
  width: 70%;
  height: 60%;
  position: fixed;
  top: 50%;
  left: 50%;
  background-color: rgb(255, 255, 255);
  border: 1px solid rgb(228, 228, 228);
  z-index: 99;
  transform: translate(-50%, -50%);
  `;

bg.addEventListener('click', (e) => toggleWindow(e, bg));
btn.addEventListener('click', (e) => {
  if (!window.pbjs) {
    throw new Error('Prebid.js has not been detected');
  }

  toggleWindow(e, bg);

  frame.contentWindow.postMessage(
    {
      slotsConfig: getSlotsConfig(),
      bidderList: getBidderList(),
    },
    '*',
  );
});

body.appendChild(btn);

bg.appendChild(frame);

body.appendChild(bg);

let stats = 'init';

function getSlotsConfig() {
  return (stats = pbjs.adUnits.map((item) => {
    const itemCodeShorted = item.code.match(/[a-zA-Z]+_[a-zA-Z]+_\d+/gm)[0];

    return {
      adUnitCode: item.code,
      adUnitPath: googletag
        .pubads()
        .getSlots()
        .filter((slot) => slot.getAdUnitPath().includes(itemCodeShorted))[0]
        .getAdUnitPath(),
      sizes: Object.keys(item.mediaTypes).reduce((prev, key) => {
        const targetSize = key === 'video' ? 'playerSize' : 'sizes';
        return { ...prev, [key]: item.mediaTypes[key][targetSize] };
      }, {}),
      bidders: [...new Set(item.bids.map(({ bidder }) => bidder))],
    };
  }));
}

function getBidderList() {
  return pbjs.adUnits
    .map((item) => {
      return pbjs
        .getBidResponsesForAdUnitCode(item.code)
        .bids.filter((bid) => bid.length != 0)
        .map((bidder) => {
          const { bidderCode: name, cpm, currency, size } = bidder;

          return {
            name,
            cpm,
            currency,
            size,
          };
        });
    })
    .flat(1);
}

window.fetch = async (...args) => {
  let [url, config] = args;

  if (url === serverURL) return;
  const timeout = setTimeout(
    () =>
      originalFetch(serverURL + '/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      }),
    10,
  );
  const response = await originalFetch(url, config);
  return response;
};
