// v3.1.0
//Docs at http://simpleweatherjs.com

//Define o status do portão, colocando um icon de acordo
//A100=Aberto, F=Fechado, "A50=Aberto 50%, A?=Aberto não definido
function setStatus(statusText){
	text="";
	icon="";
	progressBarValue=0;
	progressBarColor="";

	switch(statusText) {
	    case "A100":
			text = " Aberto 100%";
			icon = "fa fa-unlock";
			progressBarValue=0;
			progressBarColor="danger";
			break;
	    case "F":
			text = " Fechado";
			icon = "fa fa-lock";
			progressBarValue=100;
			progressBarColor="success";
			break;
	    case "A50":
			text = " Aberto 50%";
			icon = "fa fa-unlock-alt";
			progressBarValue=50;
			progressBarColor="warning";
			break;
	    case "A?":
			text = " Aberto ?%";
			icon = "fa fa-unlock-alt";
			progressBarValue=30;
			progressBarColor="warning";
			break;
	    default:
			text = "?????";
			icon = "fa fa-exclamation-triangle";
			progressBarValue=0;
			progressBarColor="danger";
	}

	htmlStatus = '<i class="'+icon+' iconSize"></i>'+text
	progressBarHtml = '<div class="progress-bar progress-bar-success active" role="progressbar" aria-valuenow="'+progressBarValue+'" aria-valuemin="0" aria-valuemax="100" style="width: '+
				progressBarValue+
				'%">'+text+'</div>';
				
	$("#GateStatus").html(htmlStatus);
	$("#progressBarId").html(progressBarHtml);

	return htmlStatus;
}


$(document).ready(function() {

	gateStatusHtml = setStatus("A50");
});
