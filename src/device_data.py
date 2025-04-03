import json
import time
import requests
from requests.auth import HTTPDigestAuth


INDXPERS_CPF       = 0
INDXPERS_NOME       =1
INDXPERS_DATAINI    =6
INDXPERS_DATAFIMQ   =7
INDXPERS_DATAULT    =9
INDXPERS_SEXO       =5

INDXDEV_ID       = 0
INDXDEV_NAME     = 1
INDXDEV_IP       = 2
INDXDEV_USERNAME = 3
INDXDEV_PASSWORD = 4
INDXDEV_EVENT    = 5
INDEXDEV_LASTDATA= 6
ARR_SEXO  =["INDEFINIDO","male", "female"]




class DeviceData:
    def __init__(self):
        pass

    def makeUserInfo(self,person):
        gender = "female"
        if person.gender == '1' or person.gender == "m" or person.gender == "M":
            gender = "male"
        return '{"UserInfo": {\
            "employeeNo": "' + str(person.id) + '",\
            "name": "' + str(person.name) + '",\
            "userType": "normal",\
            "gender": "' + gender + '",\
            "doorRight": "1",\
            "RightPlan": [\
                            {\
                                "doorNo": 1,\
                                "planTemplateNo": "1"\
                            }\
            ],\
            "valid": {\
            "enable":true,' \
            '"beginTime":"' + str(person.start_date.date())+'T'+"00:00:00" + '",' \
            '"endTime":"' + str(person.stop_date.date())+'T'+"23:59:00" + '"}}}'

        #"valid": { \
        #    "enable": true, ' \
        #            '"beginTime": "' + str(
        #    datetime.strptime(person.data_inicio, '%Y%m%d%H%M%S')).replace(' ', 'T') + '",' \
        #                                                                                     '"endTime":"' + str(
        #    datetime.strptime(person.data_fim, '%Y%m%d%H%M%S')).replace(' ', 'T') + '"}}}'


    def sendtodevice(self,dev,person):
        #print("enviando pessoa para o dev "+str(dev.name)+" nome: "+str(person.name))
        device_uri = "/ISAPI/AccessControl/UserInfo/Record?format=json"
        device_url = "http://" + dev.ip + device_uri
        device_user = dev.username
        device_passwd = dev.password

        body_data = self.makeUserInfo(person)
        headers = {'content-type': 'application/json'}
        #print(body_data)
        req = ""
        try:
            req = requests.post(device_url, data=body_data, auth=HTTPDigestAuth(device_user, device_passwd),
                                headers=headers,timeout=(3, 5))
            return req.json()
        except:
            #traceback.print_exc()
            print("SENDTODEVICE ERRO DE CONEXÃO COM O DEV " + dev.name)
            return None



    def updatePerson(self, dev, person):
        device_uri = "/ISAPI/AccessControl/UserInfo/Modify?format=json"
        device_url = "http://" + dev.ip + device_uri
        device_user = dev.username
        device_passwd = dev.password

        body_data = self.makeUserInfo(person)
        headers = {'content-type': 'application/json'}
        try:
            print(body_data)
            req = requests.put(device_url, data=body_data, auth=HTTPDigestAuth(device_user, device_passwd),
                                headers=headers,timeout=(3, 5))
            return req.json()
        except:
            #traceback.print_exc()
            print("UPDATEPERSON ERRO DE CONEXÃO COM O DEV " + dev.name)
        return None


    def rebootDevice(self, device):
        for dev in device:
            device_uri = "/ISAPI/System/reboot"
            device_url = "http://" + dev[INDXDEV_IP] + device_uri
            device_user = dev[INDXDEV_USERNAME]
            device_passwd = dev[INDXDEV_PASSWORD]
            headers = {'content-type': 'application/json'}
            req = requests.put(device_url,  auth=HTTPDigestAuth(device_user, device_passwd),
                                    headers=headers,timeout=(3, 5))
        return

    def deletePerson(self, dev, person):

            device_uri = "/ISAPI/AccessControl/UserInfo/delete?format=json"
            device_url = "http://" + dev.ip + device_uri
            device_user = dev.username
            device_passwd = dev.password

            body_data = '{\
                            "UserInfoDelCond": {\
                                "EmployeeNoList": [\
                                    {\
                                        "employeeNo": "'+str(person.id) +'"\
                                    }\
                                ],\
                                "operateType": "byTerminal",\
                                "terminalNoList": [1]\
                            }\
                        }'
            headers = {'content-type': 'application/json'}
            #print(body_data)
            try:
                ret =  requests.put(device_url, data=body_data, auth=HTTPDigestAuth(device_user, device_passwd),
                                    headers=headers,timeout=(3, 5))
                return ret.json()
            except:
                #traceback.print_exc()
                print("DELETEPERSON ERRO DE CONEXÃO COM O DEV " + dev.name)
                return None

    def getPerson(self, dev, searchResultPosition):
        device_uri = "/ISAPI/AccessControl/UserInfo/search?format=json"
        device_url = "http://"+ dev[INDXDEV_IP]  + device_uri
        device_user = dev[INDXDEV_USERNAME]
        device_passwd = dev[INDXDEV_PASSWORD]
        body_data = '{ "UserInfoSearchCond":{ \
            "searchID":"1",\
            "searchResultPosition": '+str(searchResultPosition)+',\
            "maxResults": 30\
            }\
        }'
        headers = {'content-type': 'application/json'}
        url = device_url
        print(body_data)
        try:
            req = requests.post(url, data=body_data, auth=HTTPDigestAuth(device_user, device_passwd), headers=headers,timeout=(3, 5))
            return req.json()
        except:
            #traceback.print_exc()
            print("GETPERSON ERRO DE CONEXÃO COM O DEV "+dev.name)
        return None

    def getOnePerson(self, dev, search):

        device_uri = "/ISAPI/AccessControl/UserInfo/search?format=json"
        device_url = "http://"+ dev.ip  + device_uri
        device_user = dev.username
        device_passwd = dev.password
        body_data = '{ "UserInfoSearchCond":{ \
            "searchID":"1",\
        "searchResultPosition": 0,\
        "maxResults": 1, \
        "EmployeeNoList":[{ \
        "employeeNo": "'+str(search)+'" }] \
        }\
        }'
        headers = {'content-type': 'application/json'}
        url = device_url
        #print(body_data)
        req = requests.post(url, data=body_data, auth=HTTPDigestAuth(device_user, device_passwd), headers=headers,timeout=(3, 5))

        return req.json()

    def getImage(self,dev,person,path):
        device_uri = "/ISAPI/Intelligent/FDLib/FDSearch?format=json&terminalNo=1"
        device_url = "http://" + dev.ip + device_uri
        device_user = dev.username
        device_passwd = dev.password
        body_data = '{\
                    "searchResultPosition": 0,\
                    "maxResults": 1,\
                    "faceLibType": "blackFD",\
                    "FDID": "1",\
                    "FPID": "'+str(person.id) +'"\
                }'
        headers = {'content-type': 'application/json'}
        url = device_url
        #print(body_data)
        try:
            req = requests.post(url, data=body_data, auth=HTTPDigestAuth(device_user, device_passwd), headers=headers,timeout=(3, 5))
            if ("MatchList" in req.json()):
                print("SALVANDO FOTO: " + str(person.name))
                retful = req.json()["MatchList"][0]["faceURL"]
                self.downloadImage(retful,path,person.id,dev)
                return True
            else:
                #print("SEM FOTO ENCONTRADA "+dev.name)
                pass
        except:
            #traceback.print_exc()
            print("ERRO  DE CONEXÃO COM O DEV no dev "+dev.name)
        return False


    def setImage(self,dev,person,urlorig):

        device_uri = "/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json"
        device_url = "http://" + dev.ip + device_uri
        device_user = dev.username
        device_passwd = dev.password
        body_data = '{\
                    "faceLibType": "blackFD",\
                    "FDID": "1",\
                    "FPID": "'+str(person.id) +'",\
                    "name": "'+person.name+'",\
                    "bornTime": "2021-01-01",\
                    "faceURL":"'+urlorig+str(person.id)+'"\
                }'
        headers = {'content-type': 'application/json'}
        try:
            print("enviando foto setimage" + dev.name)
            req = requests.post(device_url, data=body_data, auth=HTTPDigestAuth(device_user, device_passwd), headers=headers,timeout=(3, 5))

            time.sleep(0.5)#3626
            return req.json()
        except:
            print("SENDIMAGE ERRO DE CONEXÃO COM O DEV " + dev.name)
            return None

    def deleteFace(self, dev, person):

        device_uri = "/ISAPI/Intelligent/FDLib/FDSearch/Delete?format=json&FDID=1&faceLibType=blackFD"
        device_url = "http://" + dev.ip + device_uri
        device_user = dev.username
        device_passwd = dev.password
        body_data = '{ "FPID":[{ "value":"'+str(person.id) +'"}]}'
        headers = {'content-type': 'application/json'}
        url = device_url
        #print(body_data)
        req = requests.put(url, data=body_data, auth=HTTPDigestAuth(device_user, device_passwd), headers=headers,timeout=(3, 5))

        return req.json()

    def downloadImage(self, url,path,name,dev):
        device_user = dev.username
        device_passwd = dev.password

        r = requests.get(url, allow_redirects=True, auth=HTTPDigestAuth(device_user, device_passwd),timeout=(3, 5))
        open(path+name, 'wb').write(r.content)