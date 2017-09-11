#coding=UTF-8
import re
import json
import csv
from db import DB
heads=None
keymap={u'类别':u'type',
        u'专业':u'major',
        u'课程':u'course',
        u'书名':u'bookname',
        u'定价':u'price'}
def parseline(line):
    global heads,majors
    if(heads==None):
        heads=map(lambda k:keymap[k.decode('utf-8')],line)
        return heads
    args=line
    obj={}
    args[-1]=float(args[-1])
    for i in range(len(heads)):
        if(type(args[i])==unicode or type(args[i])==str):
            args[i]=args[i].strip('"').strip()
            if(args[i].find('[')!=-1):
                obj[heads[i]]=args[i][1:-1].split(',')
                #majors|=set(obj[heads[i]])
            else:
                obj[heads[i]]=args[i]
                #majors.add(obj[heads[i]])
        else:
            obj[heads[i]]=args[i]
    return obj
lines=[]
with open('./booklist.csv','rb') as f:
    for line in f.xreadlines():
        lines.append(line.strip())
        lines[-1]=lines[-1].decode('GBK').encode('utf-8')
f.close()

reader=csv.reader(lines)
root=[]
majors=set()
for line in reader:
    root.append(parseline(line))
root=filter(lambda x: x!=None,root)[1:]
db=DB('./books.json')
if u'price' not in db:
    db[u'price']={}
if('nextid' in db.keys()):
    index=db['nextid']
else:
    index=0
for book in root:
    bookname=book['bookname'].decode('utf-8')
    if(bookname in db.keys()):
        book['id']=db[bookname]
    else:
        book['id']=index
        db[bookname]=index
        db[unicode(index)]=bookname
        index+=1
    db[u'price'][book['id']]=book['price']
    if type(book['major'])==list:
        majors|=set(book['major'])
    else:
        majors.add(book['major'])
db['nextid']=index
db['majors']=map(lambda s:s.decode('utf-8'),list(majors))

json.dump(root,open('./booklist.json','w'),ensure_ascii=False,sort_keys=True,indent=2)













#    r
