var booklist=null;
var requested=false;

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

var totalprice=0.0;
var totalnum=0
$(document).ready(()=>getbooklist(renderList));

function renderList(){
  var table=$('#table1')
  table.children('tr').each(
    (index,tr)=>{
      let id=Number($(tr).attr('book'))
      let book=booklist.find(e=>e.id==id)
      $($(tr).children('td:eq(0)')).html(book.major)
      $($(tr).children('td:eq(1)')).html(book.course)
      $($(tr).children('td:eq(2)')).html(book.bookname)
      $($(tr).children('td:eq(3)')).html(book.price)
      let num=Number($($(tr).children('td:eq(4)')).html());
      totalprice+=book.price*num
      totalnum+=num
  })
  $('#totalprice').html(totalprice);
  $('#totalnum').html(totalnum);
}
