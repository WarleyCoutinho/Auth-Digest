import axios from 'axios';
import { createHash } from 'crypto';
import * as fs from 'fs';

// Constants from the Python file
const INDXPERS_CPF = 0;
const INDXPERS_NOME = 1;
const INDXPERS_DATAINI = 6;
const INDXPERS_DATAFIMQ = 7;
const INDXPERS_DATAULT = 9;
const INDXPERS_SEXO = 5;

const INDXDEV_ID = 0;
const INDXDEV_NAME = 1;
const INDXDEV_IP = 2;
const INDXDEV_USERNAME = 3;
const INDXDEV_PASSWORD = 4;
const INDXDEV_EVENT = 5;
const INDEXDEV_LASTDATA = 6;
const ARR_SEXO = ["INDEFINIDO", "male", "female"];

// TypeScript interfaces
interface Person {
  id: string | number;
  name: string;
  gender: string;
  start_date: Date;
  stop_date: Date;
}

interface Device {
  id?: number;
  name: string;
  ip: string;
  username: string;
  password: string;
  event?: string;
  lastData?: any;
}

export class DeviceData {
  constructor() {}

  /**
   * Creates user information JSON for the device
   */
  makeUserInfo(person: Person): string {
    let gender = "female";
    if (person.gender === '1' || person.gender === "m" || person.gender === "M") {
      gender = "male";
    }

    const startDate = person.start_date.toISOString().split('T')[0] + 'T00:00:00';
    const stopDate = person.stop_date.toISOString().split('T')[0] + 'T23:59:00';

    return JSON.stringify({
      UserInfo: {
        employeeNo: String(person.id),
        name: String(person.name),
        userType: "normal",
        gender: gender,
        doorRight: "1",
        RightPlan: [
          {
            doorNo: 1,
            planTemplateNo: "1"
          }
        ],
        valid: {
          enable: true,
          beginTime: startDate,
          endTime: stopDate
        }
      }
    });
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
          'Content-Type': 'application/json'
        },
        auth: {
          username: dev.username,
          password: dev.password
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error(`SENDTODEVICE ERROR CONNECTING TO DEVICE ${dev.name}`);
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
          'Content-Type': 'application/json'
        },
        auth: {
          username: dev.username,
          password: dev.password
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error(`UPDATEPERSON ERROR CONNECTING TO DEVICE ${dev.name}`);
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
            'Content-Type': 'application/json'
          },
          auth: {
            username: dev.username,
            password: dev.password
          },
          timeout: 5000
        });
      } catch (error) {
        console.error(`REBOOT ERROR CONNECTING TO DEVICE ${dev.name}`);
      }
    }
  }

  /**
   * Deletes a person from the device
   */
  async deletePerson(dev: Device, person: Person): Promise<any> {
    const deviceUri = "/ISAPI/AccessControl/UserInfo/delete?format=json";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;
    
    const bodyData = JSON.stringify({
      UserInfoDelCond: {
        EmployeeNoList: [
          {
            employeeNo: String(person.id)
          }
        ],
        operateType: "byTerminal",
        terminalNoList: [1]
      }
    });
    
    try {
      const response = await axios.put(deviceUrl, bodyData, {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: {
          username: dev.username,
          password: dev.password
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error(`DELETEPERSON ERROR CONNECTING TO DEVICE ${dev.name}`);
      return null;
    }
  }

  /**
   * Gets a list of persons from the device
   */
  async getPerson(dev: any, searchResultPosition: number): Promise<any> {
    const deviceUri = "/ISAPI/AccessControl/UserInfo/search?format=json";
    const deviceUrl = `http://${dev[INDXDEV_IP]}${deviceUri}`;
    
    const bodyData = JSON.stringify({
      UserInfoSearchCond: {
        searchID: "1",
        searchResultPosition: searchResultPosition,
        maxResults: 30
      }
    });
    
    try {
      console.log(bodyData);
      const response = await axios.post(deviceUrl, bodyData, {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: {
          username: dev[INDXDEV_USERNAME],
          password: dev[INDXDEV_PASSWORD]
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error(`GETPERSON ERROR CONNECTING TO DEVICE ${dev.name}`);
      return null;
    }
  }

  /**
   * Gets a specific person from the device
   */
  async getOnePerson(dev: Device, search: string | number): Promise<any> {
    const deviceUri = "/ISAPI/AccessControl/UserInfo/search?format=json";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;
    
    const bodyData = JSON.stringify({
      UserInfoSearchCond: {
        searchID: "1",
        searchResultPosition: 0,
        maxResults: 1,
        EmployeeNoList: [
          {
            employeeNo: String(search)
          }
        ]
      }
    });
    
    try {
      const response = await axios.post(deviceUrl, bodyData, {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: {
          username: dev.username,
          password: dev.password
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error(`GETONEPERSON ERROR CONNECTING TO DEVICE ${dev.name}`);
      return null;
    }
  }

  /**
   * Gets an image from the device
   */
  async getImage(dev: Device, person: Person, path: string): Promise<boolean> {
    const deviceUri = "/ISAPI/Intelligent/FDLib/FDSearch?format=json&terminalNo=1";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;
    
    const bodyData = JSON.stringify({
      searchResultPosition: 0,
      maxResults: 1,
      faceLibType: "blackFD",
      FDID: "1",
      FPID: String(person.id)
    });
    
    try {
      const response = await axios.post(deviceUrl, bodyData, {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: {
          username: dev.username,
          password: dev.password
        },
        timeout: 5000
      });
      
      if (response.data.MatchList) {
        console.log(`SAVING PHOTO: ${person.name}`);
        const faceUrl = response.data.MatchList[0].faceURL;
        await this.downloadImage(faceUrl, path, String(person.id), dev);
        return true;
      } else {
        // No photo found
        return false;
      }
    } catch (error) {
      console.error(`ERROR CONNECTING TO DEVICE ${dev.name}`);
      return false;
    }
  }

  /**
   * Sets an image on the device
   */
  async setImage(dev: Device, person: Person, urlOrig: string): Promise<any> {
    const deviceUri = "/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;
    
    const bodyData = JSON.stringify({
      faceLibType: "blackFD",
      FDID: "1",
      FPID: String(person.id),
      name: person.name,
      bornTime: "2021-01-01",
      faceURL: urlOrig + String(person.id)
    });
    
    try {
      console.log(`sending photo setimage ${dev.name}`);
      const response = await axios.post(deviceUrl, bodyData, {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: {
          username: dev.username,
          password: dev.password
        },
        timeout: 5000
      });
      
      // Sleep equivalent in JS
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return response.data;
    } catch (error) {
      console.error(`SENDIMAGE ERROR CONNECTING TO DEVICE ${dev.name}`);
      return null;
    }
  }

  /**
   * Deletes a face from the device
   */
  async deleteFace(dev: Device, person: Person): Promise<any> {
    const deviceUri = "/ISAPI/Intelligent/FDLib/FDSearch/Delete?format=json&FDID=1&faceLibType=blackFD";
    const deviceUrl = `http://${dev.ip}${deviceUri}`;
    
    const bodyData = JSON.stringify({
      FPID: [
        {
          value: String(person.id)
        }
      ]
    });
    
    try {
      const response = await axios.put(deviceUrl, bodyData, {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: {
          username: dev.username,
          password: dev.password
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error(`DELETEFACE ERROR CONNECTING TO DEVICE ${dev.name}`);
      return null;
    }
  }

  /**
   * Downloads an image from the device
   */
  async downloadImage(url: string, path: string, name: string, dev: Device): Promise<void> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        auth: {
          username: dev.username,
          password: dev.password
        },
        timeout: 5000
      });
      
      fs.writeFileSync(path + name, response.data);
    } catch (error) {
      console.error(`DOWNLOADIMAGE ERROR: ${error}`);
    }
  }
}