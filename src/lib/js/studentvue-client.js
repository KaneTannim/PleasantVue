import { encode } from "html-entities";
import * as xml2js from "xml2js";

const host = "https://ca-pleas-psv.edupoint.com";

const encode4xml = (s) => encode(s, { level: "xml" });


const makeRequest = async (req, cred) => {
    const username = encode4xml(cred.username);
    const password = encode4xml(cred.password);
    let { operation, params } = req;
    const { method } = req;
    operation = operation || "ProcessWebServiceRequest";
    if (operation = "ProcessWebServiceRequest") {
        params = {childIntId: "0", ...(params || {})};
    } else {
        params = (params || {});
    }

    

    const paramString = encode4xml("<Parms>" + (Object.entries(params).map(([k, v]) => {
        return `<${encode4xml(k)}>${encode4xml(v)}</${encode4xml(k)}>`;
    })).join("") + "</Parms>");

    const xml = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
              <${operation} xmlns="http://edupoint.com/webservices/">
                  <userID>${username}</userID>
                  <password>${password}</password>
                  <validateErrors>true</validateErrors>
                  <skipLoginLog>0</skipLoginLog>
                  <parent>0</parent>
                  <webServiceHandleName>PXPWebServices</webServiceHandleName>
                  <paramStr>${paramString}</paramStr>
                  <methodName>${method}</methodName>
              </${operation}>
          </soap:Body>
      </soap:Envelope>`.trim();

    const endpoint = new URL(host);
    endpoint.pathname = "/Service/PXPCommunication.asmx";
    const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml",
        },
        body: xml,
    });

    if (!resp.ok) {
        throw new Error("API Request Failed");
    }

    const text = await resp.text();
    const respXml = await xml2js.parseStringPromise(text);
    const innerText = respXml?.["soap:Envelope"]?.["soap:Body"]?.[0]?.[operation + "Response"]?.[0]?.[operation + "Result"]?.[0];
    if (!innerText) {
        throw new Error("Malformed SOAP body");
    }
    const innerXml = await xml2js.parseStringPromise(innerText, text);
    console.log(respXml, innerXml)
    return [innerXml, text, innerText];

};

const testCredentials = async (cred) => {
    const [data, text] = await makeRequest({
        method: "test login"
    }, cred);

    console.log(data);
    return !(text.includes("Invalid user id or password"));

};

const getChildList = async (cred) => {
    const [data] = await makeRequest({
        method: "ChildList",
        operation: "ProcessWebServiceRequestMultiWeb",
        params: {},
    }, cred);
    

    return data;
};

const getStudentInfo = async (cred) => {
    const [data] = await makeRequest({
        method: "StudentInfo",
        operation: "ProcessWebServiceRequest",
        params: {},
    }, cred);

    return data;
}

const getGradebook = async (cred, period) => {
    const [data] = await makeRequest({
        method: "Gradebook",
        operation: "ProcessWebServiceRequest",
        params: {
            ReportPeriod: period
        },
    }, cred);

    return data;
}



const data = async (cred) => {
    // assume login is valid.
    const currentPeriod = 0;

    const studentInfo = await getStudentInfo(cred);
    const childList = await getChildList(cred);
    const gradebook = await getGradebook(cred, currentPeriod);

    

    return {
        student: studentInfo?.StudentInfo || {},
        childList: childList?.ChildList ? [childList.ChildList] : [],
        periods: gradebook?.Gradebook ? [gradebook.Gradebook] : [],
        currentPeriod
    };
}


export {testCredentials, data};