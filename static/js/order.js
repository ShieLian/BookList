var lis=$('#dropdown_1').children()
for(let i=0;i<lis.length;++i){
  $(lis[i]).click(()=>{
    $('#dropdown_1_text').html($(lis[i]).children('a').html());
    let major=$(lis[i]).children('a').html();
    updateMajor(major);
  });
}

lis=$('#dropdown_2').children()
for(let i=0;i<lis.length;++i){
  $(lis[i]).click(()=>{
    $('#dropdown_2_text').html($(lis[i]).children('a').html());
    let major=$(lis[i]).children('a').html();
    updateSecondMajor(major);
  });
}

$('#tab3').click(renderCustom)
$('#tab4').click(renderCart)

$('#submit').click(()=>{
  $.post('./order.html',
    {cart:JSON.stringify(cartsum)},
    function(data, textStatus, xhr) {
    //TODO:replace with overlay
    //TODO:conditions of status code
    alert('提交成功')
    });
})

var booklist=null;
var requested=false;
var cart=[];
function getbooklist(callback){
  if(!requested){
    requested=true;
    $.getJSON('./booklist.json',
    success=(data)=>{
      booklist=data;
      if(callback)
        callback();
    });
  } else {
    //while(booklist==null){};
    callback();
  }
}
//getbooklist();
//renderCustom();

function updateMajor(major){
  localStorage['first']=major;
  //Get booklist by major | filter by major
  if(booklist==null){
    getbooklist(()=>updateMajor(major));
    return;
  }
  cart[0]=[]
  //Render the booklist
  var table=$('#table1')[0];
  table.innerHTML='';
  var filteredlist=booklist.filter((e)=>{
    let m=e.major;
    if(e.type=='任选') return false;
    if(m=='全部') return true;
    if(m===major) return true;
    if(typeof(m)=='object' && m.indexOf(major)!=-1)
      return true;
  });
  if(cartsum!=undefined&&cartsum.length>0){
    cart[0]=cartsum.filter(id=>filteredlist.map(e=>e.id).indexOf(id)!=-1)
  }
  const attr=['type','major','course','bookname','price'];
  //TODO:Sort the list by type->major->course
  for(i in filteredlist){
    let row=table.insertRow();
    row.setAttribute('value',filteredlist[i].id);
    let cell;
    for(let j=0;j<attr.length;++j){
      cell=row.insertCell();
      cell.innerHTML=filteredlist[i][attr[j]];
    }
    cell=row.insertCell();
    let btn=document.createElement("button");
    btn.className='mui-btn  mui-btn--small mui-btn--primary';
    btn.innerHTML='<text>购买</text>';
    btn.value=false;
    if(cart[0].indexOf(filteredlist[i].id)!=-1){
      $(btn).val('true');
      $(btn).css('background-color','#BBB');
      $(btn).children('text').html('取消');
    }
    cell.appendChild(btn);
    $(btn).click(()=>{
      let id=Number($(btn).parents('tr').attr('value'));
      if($(btn).val()=='false'){
        $(btn).val('true');
        $(btn).css('background-color','#BBB');
        $(btn).children('text').html('取消');
        cart[0].push(id);
      } else{
        $(btn).val('false');
        $(btn).css('background-color','#2196F3');
        $(btn).children('text').html('购买');
        cart[0]=cart[0].filter((e)=>e!=id);
      }
    });
  }
}

function updateSecondMajor(major){
  localStorage['second']=major;
  //Get booklist by major | filter by major
  if(booklist==null){
    getbooklist(()=>updateSecondMajor(major));
    return;
  }
  cart[1]=[]
  //Render the booklist
  var table=$('#table2')[0];
  table.innerHTML='';
  var filteredlist=booklist.filter((e)=>{
    let m=e.major;
    if(e.type=='任选') return false;
    if(m=='全部') return false;
    if(m===major) return true;
    if(typeof(m)=='object' && m.indexOf(major)!=-1)
      return true;
  });
  if(cartsum!=undefined&&cartsum.length>0){
    cart[1]=cartsum.filter(id=>filteredlist.map(e=>e.id).indexOf(id)!=-1)
  }
  const attr=['type','major','course','bookname','price'];
  //TODO:Sort the list by type->major->course
  for(i in filteredlist){
    let row=table.insertRow();
    row.setAttribute('value',filteredlist[i].id);
    let cell;
    for(let j=0;j<attr.length;++j){
      cell=row.insertCell();
      cell.innerHTML=filteredlist[i][attr[j]];
    }
    cell=row.insertCell();
    let btn=document.createElement("button");
    btn.className='mui-btn  mui-btn--small mui-btn--primary';
    btn.innerHTML='<text>购买</text>';
    btn.value=false;
    if(cart[1].indexOf(filteredlist[i].id)!=-1){
      $(btn).val('true');
      $(btn).css('background-color','#BBB');
      $(btn).children('text').html('取消');
    }
    cell.appendChild(btn);
    $(btn).click(()=>{
      let id=Number($(btn).parents('tr').attr('value'));
      if($(btn).val()=='false'){
        $(btn).val('true');
        $(btn).css('background-color','#BBB');
        $(btn).children('text').html('取消');
        cart[1].push(id);
      } else{
        $(btn).val('false');
        $(btn).css('background-color','#2196F3');
        $(btn).children('text').html('购买');
        cart[1]=cart[1].filter((e)=>e!=id);
      }
    });
  }
}

function getherCart(){
  cartsum=[];
  for(let i in cart){
    for(let j in cart[i]){
      if(cartsum.indexOf(cart[i][j])==-1){
        let obj=cart[i][j];
        //obj.cart=i
        cartsum.push(obj);
      }
    }
  }
}

function renderCustom(){
  //Get booklist by major | filter by major
  if(booklist==null){
    getbooklist(renderCustom);
    return
  }
  if(cart[2]==undefined){
    cart[2]=[]
  }

  var table=$('#table3')[0];
  table.innerHTML='';
  var filteredlist=booklist.filter((e)=>e.type=='任选');
  if(cartsum!=undefined&&cartsum.length>0){
    cart[2]=cartsum.filter(id=>filteredlist.map(e=>e.id).indexOf(id)!=-1)
  }
  const attr=['type','major','course','bookname','price'];
  //TODO:Sort the list by type->major->course
  for(i in filteredlist){
    let row=table.insertRow();
    row.setAttribute('value',filteredlist[i].id);
    let cell;
    for(let j=0;j<attr.length;++j){
      cell=row.insertCell();
      cell.innerHTML=filteredlist[i][attr[j]];
    }
    cell=row.insertCell();
    let btn=document.createElement("button");
    btn.className='mui-btn  mui-btn--small mui-btn--primary';
    btn.innerHTML='<text>购买</text>';
    btn.value=false;
    if(cart[2].indexOf(filteredlist[i].id)!=-1){
      $(btn).val('true');
      $(btn).css('background-color','#BBB');
      $(btn).children('text').html('取消');
    }
    cell.appendChild(btn);
    $(btn).click(()=>{
      let id=Number($(btn).parents('tr').attr('value'));
      if($(btn).val()=='false'){
        $(btn).val('true');
        $(btn).css('background-color','#BBB');
        $(btn).children('text').html('取消');
        cart[2].push(id);
      } else{
        $(btn).val('false');
        $(btn).css('background-color','#2196F3');
        $(btn).children('text').html('购买');
        cart[2]=cart[2].filter((e)=>e!=id);
      }
    });
  }
}

var totalprice=0.0;
var cartsum=[];
function renderCart(){
  getherCart();
  //Get booklist by major | filter by major
  if(booklist==null){
    getbooklist(renderCart);
    return
  }
  //Render the booklist
  var table=$('#table4')[0];
  table.innerHTML='';
  const attr=['type','major','course','bookname','price'];
  //TODO:Sort the list by type->major->course
  //TODO:change the iter to adapt huge amount
  totalprice=0.0;
  for(i in booklist){
    if(cartsum.indexOf(booklist[i].id)==-1)
      continue;
    totalprice+=booklist[i].price;
    let row=table.insertRow();
    row.setAttribute('value',booklist[i].id);
    let cell;
    for(let j=0;j<attr.length;++j){
      cell=row.insertCell();
      cell.innerHTML=booklist[i][attr[j]];
    }
    cell=row.insertCell();
    let btn=document.createElement("button");
    btn.className='mui-btn  mui-btn--small mui-btn--danger';
    btn.innerHTML='<text>删除</text>';
    btn.value=true;
    cell.appendChild(btn);
    $(btn).click(()=>{
      let id=Number($(btn).parents('tr').attr('value'));
      if($(btn).val()=='true'){
        $(btn).val('false');
        $(btn).css('background-color','#BBB');
        $(btn).children('text').html('取消');
        cartsum=cartsum.filter((e)=>e!=id);
        totalprice-=booklist[id].price;
      } else{
        $(btn).val('true');
        $(btn).css('background-color','#F44336');
        $(btn).children('text').html('删除');
        cartsum.push(id);
        totalprice+=booklist[id].price;
      }
      for(let i in cart){
        if(cart[i].indexOf(id)!=-1){
          $('#table'+Number(i+1)+'>tr[value='+id+']>td>button').click();
        }
      }
      $('#totalprice').html('￥'+totalprice);
    });
  }
  $('#totalprice').html('￥'+totalprice);
}

function restore(){
  let firstmajor=localStorage['first'];
  let secondmajor=localStorage['second'];
  $('#dropdown_1>li[value='+firstmajor+']').click();
  $('#dropdown_2>li[value='+secondmajor+']').click();
  renderCustom();
  $('#tab4>a')[0].click();
}

$(document).ready(function() {
  $.getJSON('./order.json?username='+$('#username').html(),
    sucess=(data)=>{
      if(data.length!=0){
        cartsum=data;
        getbooklist(restore);
      }
    });
});
