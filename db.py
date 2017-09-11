#coding=UTF-8
import json
import os
class DB:
    def __init__(self,filepath,readonly=False):
        if(os.path.exists(filepath)):
            with open(filepath,'r') as f:
               self._dict=(json.load(f))
            f.close()
        else:
            self._dict={}
            with open(filepath,'w') as f:
               f.write(json.dumps(self._dict,ensure_ascii=False).encode('utf-8'))
            f.close()
        self.filepath=filepath
        self.timestamp=os.path.getmtime(filepath)
        self.readonly=readonly
    def __load(self):
        mtime=os.path.getmtime(self.filepath)
        if(mtime>self.timestamp):
            self.timestamp=mtime
            with open(self.filepath,'r') as f:
                self._dict=json.load(f)
            f.close()
            return False
        return True

    def __save(self):
        if(self.readonly):
            return
        s=json.dumps(self._dict,ensure_ascii=False)
        with open(self.filepath,'w') as f:
            f.write(s.encode('utf-8'))
        f.close()
        self.timestamp=os.path.getmtime(self.filepath)

    def __getattr__(self,attr):
        if('set' in attr and self.readonly):
            return
        innerattr=self._dict.__getattribute__(attr)
        if '__call__' in dir(innerattr):
            def wrapper(*tupleArg,**dictArg):
                self.__load()
                innerattr=self._dict.__getattribute__(attr)
                res=innerattr(*tupleArg,**dictArg)
                self.__save()
                if(type(res)==dict or type(res)==list):
                    return Wrapper(res,self.__load,self.__save)
                else:
                    return res
            return wrapper
        else:
            return innerattr
class Wrapper:
    def __init__(self,obj,load,save):
        self.obj=obj
        self.load=load
        self.save=save
    def __getattr__(self,attr):
        innerattr=self.obj.__getattribute__(attr)
        if '__call__' in dir(innerattr):
            def wrapper(*tupleArg,**dictArg):
                self.load()
                innerattr=self.obj.__getattribute__(attr)
                res=innerattr(*tupleArg,**dictArg)
                self.save()
                if(type(res)==dict or type(res)==list):
                    return Wrapper(res,self.load,self.save)
                else:
                    return res
            return wrapper
        else:
            return innerattr
