# -*- coding: UTF-8 -*-
from flask import Flask
from flask import render_template,url_for,redirect
from flask import request,session,make_response
import functools
import json,re
from db import DB
from md5 import md5
app = Flask(__name__)

def require_login(func):
    @functools.wraps(func)
    def work():
        if not 'username' in session:
            return make_response('please login first', 401)
        username=session['username']
        if not check_session(username):
            return make_response('please login first', 401)
        return func()
    return work

def require_admin(func):
    @functools.wraps(func)
    def work():
        username=session['username']
        if username!='admin':
            return make_response('U aren\'t admin', 401)
        return func()
    return work

@app.route('/')
def index():
    if('username' in session):
        if(session['username']=='admin'):
            return redirect(url_for('summary'))
        else:
            return redirect(url_for('order'))
    else:
        return render_template('index.html',
                               css=url_for('static',filename='css/index.css'),
                               jquery=url_for('static',filename='js/jquery-3.2.1.min.js'))

@app.route('/login',methods=['POST'])
def login():
    username=request.form['username']
    psw=request.form['psw']
    if(check_login(username,psw)):
        session['username']=username
        return '{"status":"success","msg":"none"}'
    return '{"status":"fail","msg":"用户名或密码错误"}'

@require_login
@app.route('/logout',methods=['POST'])
def logout():
    username=session['username']
    session.pop('username',None)
    return redirect(url_for('index'))


@app.route('/register',methods=['POST'])
def reg():
    username=request.form['username']
    psw=request.form['psw']
    msg=None
    status='fail'
    if(len(username)<3):
        msg='用户名至少三字符'
    elif(len(psw)<6):
        msg='密码至少6字符'
    elif(unicode(username) in db['users']):#查重
        msg='用户名已存在'
    else:
        status='success'
        msg='success'
        db['users'][unicode(username)]=md5(unicode(psw)).hexdigest()
    return '{"status":"%s","msg":"%s"}'%(status,msg)

@app.route('/order.html',methods=['GET','POST'])
@require_login
def order():
    if(request.method=='GET'):
        return render_template('order.html',
                               js=url_for('static',filename='js/'),
                               css=url_for('static',filename='css/'),
                               username=session['username'],
                               majors=majors)
    elif(request.method=='POST'):
        cart=request.form['cart']
        if re.match('^\[((\d)+,)+\d+\]$',cart)==None:
            raise KeyError
        cart=map(int,cart.strip('[]').split(','))
        username=session['username']
        db[u'order'][username]=cart
        return '0'

@app.route('/summary.html',methods=['GET'])
@require_login
def summary():
    if session['username']!='admin':
        return make_response('U aren\'t admin', 401)
    orders=db[u'order']
    books=db[u'book']
    users=[]#[{name,money}]
    orderbooks={}#{bookid:num}
    for user in orders:
        money=0.0
        suborder=orders[user]
        for book in suborder:
            money+=books[str(book)]
            if(str(book) in orderbooks):
                orderbooks[str(book)]+=1
            else:
                orderbooks[str(book)]=1
        users.append({'name':user,'money':money})
    return render_template('summary.html',
                           js=url_for('static',filename='js/'),
                           css=url_for('static',filename='css/'),
                           books=orderbooks,
                           users=users)


@app.route('/order.json',methods=['GET'])
@require_login
def orderlist():
    username=unicode(request.args.get('username'))
    if username in db[u'order']:
        #msg=json.dumps(db[u'order'][username],ensure_ascii=False)
        msg=str(db[u'order'][username])
        return msg
    else:
        return '[]'

@app.route('/booklist.json',methods=['GET'])
@require_login
def booklist():
    response=app.send_static_file('./booklist.json')
    return response

def check_login(username,psw):
    username=unicode(username)
    psw=unicode(psw)
    psw=md5(psw).hexdigest()
    if (username in db['users']) and (db['users'][username]==psw):
        return True
    else:
        return False

def check_username(username):
    if len(username)<3:
        return False
    for c in username:
        if not ((c in "0123456789_~!@#$%^&*-=+") or (c>='a' and c<='z') or (c>='A' and c<='Z')):
            return False
    username=unicode(username)
    return (username in db['users'])

def check_psw(psw):
    if len(psw)<6:
        return False
    for c in username:
        if not ((c in "0123456789_~!@#$%^&*-=+") or (c>='a' and c<='z') or (c>='A' and c<='Z')):
            return False
    return True

def check_session(username):
    if len(username)<3:
        return False
    for c in username:
        if not ((c in "0123456789_~!@#$%^&*-=+") or (c>='a' and c<='z') or (c>='A' and c<='Z')):
            return False
    return True

'''
Generate a key like this:
>>> import os
>>> os.urandom(24)
'\xca\x0c\x86\x04\x98@\x02b\x1b7\x8c\x88]\x1b\xd7"+\xe6px@\xc3#\\'
'''
#app.secret_key='X\x90\xed\xb5\xb6\xe0\xf3\x7f\xf73\xe2@\x0c\xac\xf6\x12\xa3k\xc1\xc0\xd7\x93wg'
db=DB('./db.json')
db[u'book']={}
bookdb=DB('./books.json',readonly=True)
majors=bookdb['majors']
bookdb=bookdb[u'price']
for k in bookdb:
    db[u'book'][k]=bookdb[k]

if __name__ == '__main__':
    print '[Warn]Please config your secret_key in line#176'
    print '[Warn]Please register as admin first'
    app.run(debug=False)
