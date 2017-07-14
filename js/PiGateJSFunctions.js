function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//Define se um elemento está enabled e\ou se é para mostrar
function enableDisableButton(isEnable,isDisplay,buttonId){
	disabledValue = "";
	displayNoneValue = "";
	
	if(isEnable == true){
		disabledValue = false;
	}else{
		disabledValue = true;
	}
	if(isDisplay == true){
		displayNoneValue = "";
	}else{
		displayNoneValue = "none";
	}
	$("[id="+buttonId+"").prop('disabled', disabledValue);
	$("[id="+buttonId+"").css('display', displayNoneValue);
}