//DB of card
var cardList = [];
cardList[0] = {};
cardList[0].number = "1111 1111 1111 1111";
cardList[0].month = "01";
cardList[0].year = "20";
cardList[0].CVV = 123;
cardList[0].money = 1000;

cardList[1] = {};
cardList[1].number = "2222 2222 2222 2222";
cardList[1].month = "02";
cardList[1].year = "21";
cardList[1].CVV = 234;
cardList[1].money = 10000;

cardList[2] = {};
cardList[2].number = "3333 3333 3333 3333";
cardList[2].month = "03";
cardList[2].year = "22";
cardList[2].CVV = 345;
cardList[2].money = 100000;

cardList[3] = {};
cardList[3].number = "1234 1234 1234 1234";
cardList[3].month = "04";
cardList[3].year = "23";
cardList[3].CVV = 567;
cardList[3].money = 1000000;

var transactionList = [];

function start(){
	$.ajax({
		url: "http://178.151.136.219:1111/getlist",
		method: "POST",
			success : function(data) {
				tableLoad(JSON.parse(data));
			},
	}).fail(function (){
		alert("Conn Err");
	});
}

function tableLoad(data){
	for (var i = 0; i < data.length; i++){
		
		data[i].year = data[i].Year;
		delete data[i].Year;
		data[i].month = data[i].Month;
		delete data[i].Month ;
		data[i].receiver = data[i].Receiver;
		delete data[i].Receiver;
		data[i].sender = data[i].Sender;
		delete data[i].Sender;
		data[i].money = parseFloat(data[i].Money, 10);
		delete data[i].Money; 
		data[i].commission = parseFloat(data[i].Commission, 10);
		delete data[i].Commission;
		
		for (var j = 0; j < 4; j++){
			if (data[i].receiver == cardList[j].number){
				data[i].receiverID = j;
			}
			if (data[i].sender == cardList[j].number){
				data[i].cardID = j;
			}
		}
		
		cardList[data[i].cardID].money -= data[i].money;
		cardList[data[i].cardID].money -= data[i].commission;
		cardList[data[i].receiverID].money += data[i].money;
		
		tableAppend(data[i]);
	}
}

function validation(){
	
	if ($("#moneySend").text() != "Перевести"){
		return false;
	}
	
	let transaction = {};
	transaction.sender = $("#sender").val();
	transaction.month = $("#month").val();
	transaction.year = $("#year").val();
	transaction.CVV = $("#CVV").val();
	transaction.receiver = $("#receiver").val();
	transaction.money = $("#money").val();

	let errorString = "";
	let err = false;
	
	//sender card chk
	let validNumber = false;
	transaction.cardID = "none";
	transaction.receiverID;
	for (var i = 0; i < cardList.length; i++) {
		if (transaction.sender == cardList[i].number){
			validNumber = true;
			transaction.cardID = i;
			if (transaction.month != cardList[i].month){
				err = true;
				errorString += "Неверный месяц \n";
				$("#month").css("border", "3px solid red");
			}else{
				$("#month").css("border", "3px solid #553311");
			}
			if (transaction.year != cardList[i].year){
				err = true;
				errorString += "Неверный год \n";
				$("#year").css("border", "3px solid red");
			}else{
				$("#year").css("border", "3px solid #553311");
			}
			if (transaction.CVV != cardList[i].CVV){
				err = true;
				errorString += "Неверный CVV \n";
				$("#CVV").css("border", "3px solid red");
			}else{
				$("#CVV").css("border", "3px solid #553311");
			}
			break;
		}
	}
	if (!validNumber){
		err = true;
		errorString += "Неверный номер карты отправителя \n";
		$("#sender").css("border", "3px solid red");
	}else{
		$("#sender").css("border", "3px solid #553311");
	}
	
	//receiver card chk
	validNumber = false;
	for (var i = 0; i < cardList.length; i++) {
		if (transaction.receiver == cardList[i].number){
			validNumber = true;
			transaction.receiverID = i;
			break;
		}
	}
	if (!validNumber){
		err = true;
		errorString += "Неверный номер карты получателя \n";
		$("#receiver").css("border", "3px solid red");
	}else{
		$("#receiver").css("border", "3px solid #553311");
	}
	
	//cash available chk
	var euroToDollar = 1.12;
	var hryvniaToDollar = 0.038;
	let cash = parseInt(transaction.money, 10);
	if (cash > 0) {
		
		//currency diff
		curr = document.getElementById("currency").value;
		if (curr == 1){
			cash *= euroToDollar;
		}else{
			if (curr == 2){
			cash *= hryvniaToDollar;
			}
		};
		
		if ( (transaction.cardID != "none") && (cardList[transaction.cardID].money < cash) ){
			err = true;
			errorString += "Недостаточно стредств \n";
			$("#money").css("border", "3px solid red");
		}else{
			$("#money").css("border", "3px solid #553311");
		}
		
	}else{
		
		err = true;
		errorString += "Неверная сумма перевода \n";
		$("#money").css("border", "3px solid red");
	}
	
	//err chk
	if (err){
		alert(errorString);
	}else{
		//commission count
		cash = Math.ceil(cash * 100) / 100;
		transaction.commission = Math.ceil(cash * 0.005 * 100) / 100;
		cash -= transaction.commission;
		transaction.money = cash;
		cardList[transaction.cardID].money -= cash;
		cardList[transaction.cardID].money -= transaction.commission;
		cardList[transaction.receiverID].money += cash;
		cardList[transaction.cardID].money = Math.ceil(cardList[transaction.cardID].money * 100) / 100;
		cardList[transaction.receiverID].money = Math.ceil(cardList[transaction.receiverID].money * 100) / 100;
		
		//button change
		$("#moneySend").css("border", "3px solid green");
		$("#moneySend").text("Успешный перевод");
		setTimeout(
			function moneyButton(){
				$("#moneySend").css("border", "3px solid #553311");
				$("#moneySend").text("Перевести");
			}
		, 1000);
		
		transaction.ID = transactionList.length;
		transaction.ID = transaction.ID.toString();
		transaction.commission = transaction.commission.toString();
		transaction.money = transaction.money.toString();
		
		//send to server
		var sendData = JSON.stringify(transaction);
		$.ajax({
			url: "http://178.151.136.219:1111/add",
			method: "POST",
			data : { sendedData: sendData},
				success : function(rdata) {
					transaction.DBID = rdata; 
					tableAppend(transaction);
				},
		}).fail(function (){
			alert("Conn Err");
		});
		
		transaction.commission = parseFloat(transaction.commission.toString(), 10);
		transaction.money = parseFloat(transaction.money.toString(), 10);
	}
	
	//return & not-reset form
	return false;
}

function tableAppend(transaction){
	//add to table
	console.log(transaction);
	for (var i = 0; i < 4; i++){
		console.log(cardList[i].number + " | " + cardList[i].money);
	}
	
	$("#table").append(
	"<tr>" + 
		"<td><a href=\"transaction/" + transaction.DBID + "\">" + transaction.sender + "</td>" + 
		"<td>" + transaction.receiver  + "</td>" + 
		"<td>" + transaction.money  + "</td>" + 
		"<td>" + transaction.commission  + "</td>" + 
	"</tr>")
	transactionList[transactionList.length] = transaction;
}

function filter(){
	let table = document.getElementById("table");
	for (var i = 1; i < table.rows.length; i++){
		if (parseInt(table.rows[i].cells[2].innerHTML, 10) >= 100){
			table.rows[i].cells[2].style.border = "1px solid #FFDDBB";
		}
	}
}

function undo(){
	let table = document.getElementById("table");
	if (table.rows.length-2 >= 0){
		var sendData = (table.rows.length-2).toString();
		$.ajax({
			url: "http://178.151.136.219:1111/delete",
			method: "POST",
			data : { sendedData: sendData},
				success : function() {
					undoComplete();
				},
		}).fail(function (){
			alert("Conn Err");
		});
	}
}

function undoComplete(){
	let table = document.getElementById("table");
	let i = table.rows.length-2;//-2 because table header added +1 
	cardList[transactionList[i].cardID].money += transactionList[i].commission + transactionList[i].money;
	cardList[transactionList[i].receiverID].money -= transactionList[i].money;
	transactionList.splice(i, 1);
	table.deleteRow(table.rows.length-1);
	
	for (i = 0; i < 4; i++){
		console.log(cardList[i].number + " | " + cardList[i].money);
	}
}

function checks(){
	var newWin;
	newWin = window.open("about:blank", "Checks", "width=500, height=500");
	for(var i = 0 ; i < transactionList.length; i++){
		newWin.document.write(
		"<br/>month: " + transactionList[i].month + 
		"<br/>year: " + transactionList[i].year + 
		"<br/>CVV: " + transactionList[i].CVV+ 
		"<br/>sender: " + transactionList[i].sender + 
		"<br/>receiver: " + transactionList[i].receiver + 
		"<br/>money: " + transactionList[i].money + 
		"<br/>commission: " + transactionList[i].commission + 
		"<br/><br/>");
	}
	newWin.document.write("<script>setTimeout(function(){window.close()}, 5000);</script>");
}

function autoFill(){
	document.getElementById("sender").value = "1111 1111 1111 1111";
	document.getElementById("month").value = "01";
	document.getElementById("year").value = "20";
	document.getElementById("CVV").value = "123";
	document.getElementById("receiver").value = "1234 1234 1234 1234";
	document.getElementById("money").value = "100";
}

//input restrictions
$("#sender").keypress(function(e) {
    if (e.keyCode < 48 || e.keyCode > 57 || document.getElementById("sender").value.length == 19) {
        return false;
    }
	var num = document.getElementById("sender").value.length;
	if ([4,9,14].includes(num)){
		document.getElementById("sender").value += " ";
	}
});

$("#receiver").keypress(function(e) {
    if (e.keyCode < 48 || e.keyCode > 57 || document.getElementById("receiver").value.length == 19) {
        return false;
    }
	var num = document.getElementById("receiver").value.length;
	if ([4,9,14].includes(num)){
		document.getElementById("receiver").value += " ";
	}
});

$("#CVV").keypress(function(e) {
    if (e.keyCode < 48 || e.keyCode > 57 || document.getElementById("CVV").value.length == 3) {
        return false;
    }
});

$("#money").keypress(function(e) {
    if (e.keyCode < 48 || e.keyCode > 57 || document.getElementById("money").value.length == 10) {
        return false;
    }
});
