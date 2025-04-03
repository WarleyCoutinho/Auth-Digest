// src/services/deviceService.ts
import axios from "axios";
import * as fs from "fs";
import type { Device, Person } from "../../types";

export class DeviceService {
  /**
   * Creates user information JSON for the device
   */
  makeUserInfo(person: Person): string {
    let gender = "female";
    if (
      person.gender === "1" ||
      person.gender === "m" ||
      person.gender === "M"
    ) {
      gender = "male";
    }

    return `{"UserInfo": {
            "employeeNo": "${String(person.id)}",
            "name": "${String(person.name)}",
            "userType": "normal",
            "gender": "${gender}",
            "doorRight": "1",
            "RightPlan": [
                            {
                                "doorNo": 1,
                                "planTemplateNo": "1"
                            }
            ],
            "valid": {
            "enable":true,
            "beginTime":"${
              person.start_date.toISOString().split("T")[0]
            }T00:00:00",
            "endTime":"${
              person.stop_date.toISOString().split("T")[0]
            }T23:59:00"}}}`;
  }

  /**
   * Sends person information to the device
   */
  async sendToDevice(dev: Device, person: Person): Promise<any> {
    const deviceUri = "/ISAPI/AccessControl/UserInfo/Record?format=json";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;
    const bodyData = this.makeUserInfo(person);

    try {
      const response = await axios.post(deviceUrl, bodyData, {
        headers: {
          "content-type": "application/json",
        },
        auth: {
          username: dev.username,
          password: dev.password,
        },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      console.error(`SENDTODEVICE ERRO DE CONEXÃO COM O DEV ${dev.name}`);
      return null;
    }
  }

  /**
   * Updates person information on the device
   */
  async updatePerson(dev: Device, person: Person): Promise<any> {
    const deviceUri = "/ISAPI/AccessControl/UserInfo/Modify?format=json";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;
    const bodyData = this.makeUserInfo(person);

    try {
      console.log(bodyData);
      const response = await axios.put(deviceUrl, bodyData, {
        headers: {
          "content-type": "application/json",
        },
        auth: {
          username: dev.username,
          password: dev.password,
        },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      console.error(`UPDATEPERSON ERRO DE CONEXÃO COM O DEV ${dev.name}`);
      return null;
    }
  }

  /**
   * Reboots devices
   */
  async rebootDevice(devices: Device[]): Promise<void> {
    for (const dev of devices) {
      const deviceUri = "/ISAPI/System/reboot";
      const deviceUrl = `http://${dev.ip}${deviceUri}`;

      try {
        await axios.put(deviceUrl, null, {
          headers: {
            "content-type": "application/json",
          },
          auth: {
            username: dev.username,
            password: dev.password,
          },
          timeout: 5000,
        });
      } catch (error) {
        // Log error silently
      }
    }
  }

  /**
   * Deletes a person from the device
   */
  async deletePerson(dev: Device, person: Person): Promise<any> {
    const deviceUri = "/ISAPI/AccessControl/UserInfo/delete?format=json";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;

    const bodyData = `{
                            "UserInfoDelCond": {
                                "EmployeeNoList": [
                                    {
                                        "employeeNo": "${String(person.id)}"
                                    }
                                ],
                                "operateType": "byTerminal",
                                "terminalNoList": [1]
                            }
                        }`;

    try {
      const response = await axios.put(deviceUrl, bodyData, {
        headers: {
          "content-type": "application/json",
        },
        auth: {
          username: dev.username,
          password: dev.password,
        },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      console.error(`DELETEPERSON ERRO DE CONEXÃO COM O DEV ${dev.name}`);
      return null;
    }
  }

  /**
   * Gets a list of persons from the device
   */
  async getPerson(dev: Device, searchResultPosition: number = 0): Promise<any> {
    const deviceUri = "/ISAPI/AccessControl/UserInfo/search?format=json";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;

    const bodyData = `{ "UserInfoSearchCond":{ 
            "searchID":"1",
            "searchResultPosition": ${searchResultPosition},
            "maxResults": 30
            }
        }`;

    try {
      console.log(bodyData);
      const response = await axios.post(deviceUrl, bodyData, {
        headers: {
          "content-type": "application/json",
        },
        auth: {
          username: dev.username,
          password: dev.password,
        },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      console.error(`GETPERSON ERRO DE CONEXÃO COM O DEV ${dev.name}`);
      return null;
    }
  }

  /**
   * Gets a specific person from the device
   */
  async getOnePerson(dev: Device, search: string | number): Promise<any> {
    const deviceUri = "/ISAPI/AccessControl/UserInfo/search?format=json";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;

    const bodyData = `{ "UserInfoSearchCond":{ 
        "searchID":"1",
        "searchResultPosition": 0,
        "maxResults": 1, 
        "EmployeeNoList":[{ 
        "employeeNo": "${String(search)}" }] 
        }
        }`;

    try {
      const response = await axios.post(deviceUrl, bodyData, {
        headers: {
          "content-type": "application/json",
        },
        auth: {
          username: dev.username,
          password: dev.password,
        },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets an image from the device
   */
  async getImage(dev: Device, person: Person, path: string): Promise<boolean> {
    const deviceUri =
      "/ISAPI/Intelligent/FDLib/FDSearch?format=json&terminalNo=1";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;

    const bodyData = `{
                    "searchResultPosition": 0,
                    "maxResults": 1,
                    "faceLibType": "blackFD",
                    "FDID": "1",
                    "FPID": "${String(person.id)}"
                }`;

    try {
      const response = await axios.post(deviceUrl, bodyData, {
        headers: {
          "content-type": "application/json",
        },
        auth: {
          username: dev.username,
          password: dev.password,
        },
        timeout: 5000,
      });

      if (response.data.MatchList) {
        console.log(`SALVANDO FOTO: ${person.name}`);
        const faceUrl = response.data.MatchList[0].faceURL;
        await this.downloadImage(faceUrl, path, String(person.id), dev);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(`ERRO DE CONEXÃO COM O DEV no dev ${dev.name}`);
      return false;
    }
  }

  /**
   * Sets an image on the device
   */
  async setImage(dev: Device, person: Person, urlOrig: string): Promise<any> {
    const deviceUri = "/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;

    const bodyData = `{
                    "faceLibType": "blackFD",
                    "FDID": "1",
                    "FPID": "${String(person.id)}",
                    "name": "${person.name}",
                    "bornTime": "2021-01-01",
                    "faceURL":"${urlOrig}${String(person.id)}"
                }`;

    try {
      console.log("enviando foto setimage" + dev.name);
      const response = await axios.post(deviceUrl, bodyData, {
        headers: {
          "content-type": "application/json",
        },
        auth: {
          username: dev.username,
          password: dev.password,
        },
        timeout: 5000,
      });

      // Sleep equivalent in JS - match Python's time.sleep(0.5)
      await new Promise((resolve) => setTimeout(resolve, 500));

      return response.data;
    } catch (error) {
      console.error(`SENDIMAGE ERRO DE CONEXÃO COM O DEV ${dev.name}`);
      return null;
    }
  }

  /**
   * Deletes a face from the device
   */
  async deleteFace(dev: Device, person: Person): Promise<any> {
    const deviceUri =
      "/ISAPI/Intelligent/FDLib/FDSearch/Delete?format=json&FDID=1&faceLibType=blackFD";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;

    const bodyData = `{ "FPID":[{ "value":"${String(person.id)}"}]}`;

    try {
      const response = await axios.put(deviceUrl, bodyData, {
        headers: {
          "content-type": "application/json",
        },
        auth: {
          username: dev.username,
          password: dev.password,
        },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Downloads an image from the device
   */
  private async downloadImage(
    url: string,
    path: string,
    name: string,
    dev: Device
  ): Promise<void> {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        auth: {
          username: dev.username,
          password: dev.password,
        },
        timeout: 5000,
      });

      fs.writeFileSync(path + name, response.data);
    } catch (error) {
      console.error(`DOWNLOADIMAGE ERROR: ${error}`);
    }
  }
}

export default new DeviceService();
