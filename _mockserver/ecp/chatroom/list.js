const faker = require("faker");

module.exports = {
    pageCount: 1,
    _header_: {
        success: true,
        timeCost: 100,
    },
    hasNextPage: false,
    recordCount: 100,
    items: makeChatList(20),
};

function makeChatList(recordNum = 10) {
    const list = [];
    for (let i = 0; i < recordNum; i++) {
        const idx = !((i + 1) % 7) ? 1 % 7 : (i + 1) % 7;
        const obj = {
            FId: faker.random.uuid(),
            FIcon: "https://bootdey.com/img/Content/avatar/avatar" + idx + ".png",
            FIsUnRead: faker.random.boolean(),
            FUserName: `[${i + 1}] ${faker.name.firstName()}`,
            FLastMessage: faker.commerce.productDescription(),
            FUpdateTime: +new Date(faker.date.past()),
        };

        if (i === 0) obj.FId = "17d6fe9f-8320-0932-4a23-00155dd13fcf";

        list.push(obj);
    }

    return list;
}
