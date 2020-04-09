const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const faker = require("faker");
const axios = require("axios");
const protobuf = require("protobufjs");

const config = require("./config");

const adapter = new FileSync(config.database);
const db = low(adapter);
const nodeCollection = db.get("nodes");

protobuf.load("./server/report.proto", (err, reportProto) => {
  const OspInfo = reportProto.lookupType("report.OspInfo");

  nodeCollection
    .value()
    // .slice(0, 1)
    .forEach((node) => {
      const hostName = faker.internet.ip();
      const payload = {
        ethAddr: node.id,
        hostName,
        port: "8000",
        payments: faker.random.number(),
        openAccept: faker.random.boolean(),
        stdOpenchanConfig: {
          tokenAddr: "0x82e8A274AdDa78D7F09c12Ae8af06c2cf081B396",
          minDeposit: "10000",
          maxDeposit: "10000",
        },
        adminInfo: {
          name: faker.name.firstName(),
          email: faker.internet.email(),
          organization: faker.company.companyName(),
          address: faker.address.streetAddress(),
          website: faker.internet.domainName(),
        },
      };
      const ospInfoMsg = OspInfo.create(payload);
      axios
        .post(`http://localhost:8000/report`, {
          ospInfo: OspInfo.encode(ospInfoMsg).finish().toJSON().data,
        })
        .catch(() => {});
    });
});
