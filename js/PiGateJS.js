localIPMasc = '192.168.1.*'
isLocalNetWork = false;

keepModalImageLoop = false;
modalImageLoopIntervalId = 0;


//Tempo de abertura do portão
gateOpeningTime = 40;
isEnableAutoRefresh = false

gateToggleIntervalId = 0;

localServicesIP = "http://192.168.1.72/pigate"
publicServicesIP = "http://vascodmendespi3.ddns.net:8085/pigate"
ipURL = localServicesIP; //Por Default, o IP é o público


serviceUser = "vascodmendes";
servicePassword = "Vasc0DMende5";
//serviceAuth = 'Basic ' + Base64.encode(serviceUser + ':' + servicePassword);
//serviceAuth = 'Basic ' + serviceUser + ':' + servicePassword;

function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return 'Basic ' + hash;
}

function printCurrentServicesIP(){
	console.log(ipURL);
	return ipURL;
}

function setNetWorkIcon(network){
	if(network == "local"){
		$("#iconWebNetwork").hide()
		$("#iconHomeNetwork").show()
		
	}else{
		if(network == "web"){
			$("#iconWebNetwork").show()
			$("#iconHomeNetwork").hide()			
		}else{
			$("#iconWebNetwork").hide()
			$("#iconHomeNetwork").hide()
		}
	}
}

function getNetworkLocation(){
	$.ajax({
		url: ipURL+'/getMyIP',
		type: 'GET',
		cache: false,
		timeout:3000,
		headers: {
			"Authorization": serviceAuth
		},
		success:function(data){
			myIPRequest = data.ipRequest;
			console.log(myIPRequest)
			if(myIPRequest.match(localIPMasc)){
				ipURL = localServicesIP;
				isLocalNetWork = true;
				setNetWorkIcon("local");
			}else{
				ipURL = publicServicesIP;
				isLocalNetWork = false;	
				setNetWorkIcon("web");
			}			
		},
		error:function(data){
			console.log('Erro na ligação à rede. A alterar o IP destino')
			//Em caso de erro de comunicação, trocamos o endereço, para tentar com o outro
			if(isLocalNetWork == true){
				ipURL = publicServicesIP;
				isLocalNetWork = false;	
			}else{
				ipURL = localServicesIP;
				isLocalNetWork = true;
			}
			setNetWorkIcon("");
		}
	})
}

serviceAuth = make_base_auth(serviceUser, servicePassword);

//######################################\\
//Gestão de mensagens
function showMessage(type,message,isAutoCLose){
	$('#messageContainerId').hide();
	$('#messageContainerId').html("");
		
	//"Sucesso"
	alertBoxId = "";
	style = "";
	
	if(type == 'S'){
		alertBoxId = 'successMessageId'
		style = "success";
	}
	else if (type == 'E'){
		alertBoxId = 'errorMessageId'
	}
	else if (type = 'W'){
		alertBoxId = 'warningMessageId'
		style = "warning";
	}
	
	closehtmlCode = '<div id="'+alertBoxId+'" class="alert '+style+' alert-dismissable">'+message
	closehtmlCode = closehtmlCode+ '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
	closehtmlCode = closehtmlCode+ '</div>'
	
	$(messageContainerId).append(closehtmlCode);

	$('#messageContainerId').slideDown(400);
	if(isAutoCLose == true){
		$('#messageContainerId').delay(2000).slideUp(400);	
	}	
}

//###########################################\\
//      --- Funções da Progress Bar --       \\

function setPercentageStatusBar(percentage){
	$('#progresssBarStrip').attr('aria-valuenow',percentage).css('width',percentage+'%').text(percentage+'%')
}

function getPercentageStatusBar(){
	return $('#progresssBarStrip').attr('aria-valuenow')
}

function hideStatusBar(){
	$('#ProgressBarDisplayId').slideUp();
}
function displayStatusBar(){
	$('#ProgressBarDisplayId').slideDown();	
}

function animateStatusBar(gateStatusCurrent,gateStatusGoal){
	currentBarPercentage = getPercentageStatusBar();
	
	setPercentageStatusBar(gateStatusCurrent)
	
	gateStatusPercent = gateStatusGoal+"%";
	
	$('#progresssBarStrip').addClass("active");
	$('#progressBarId').addClass("progress-striped");
	$('#ProgressBarDisplayId').slideDown();

	var $progress = $('.progress');
	var $progressBar = $('.progress-bar');
	
	currentPercentage = gateStatusCurrent;
	if(currentPercentage == 0){
		currentPercentage = 1;
	}
	
	displayPercentage = currentPercentage;
	
	percentageDelta = Math.abs(gateStatusGoal - currentPercentage);
		
	ProcessTime = (percentageDelta*gateOpeningTime*1000)/100; //Tempo que falta até completar a tarefa
	AnimeDuration = ProcessTime;
	
	$('#progresssBarStrip').addClass("active");
	$('#progressBarId').addClass("progress-striped");
	$progressBar.animate(
			{width: gateStatusPercent}, 
			{
				duration: AnimeDuration,
				step: function(){
					
					displayPercentage = Math.round((parseInt($progressBar.css("width")) / parseInt($('#progressBarId').css("width")))*100);
					$progressBar.text(displayPercentage+"%")
					
				},
				done: function(){
					console.log("Display Percentage= "+displayPercentage)
					$progressBar.attr('aria-valuenow',gateStatusGoal);
					$('#progresssBarStrip').removeClass("active")
					$('#progressBarId').removeClass("progress-striped");
				}
			})
}

function stopStatusBarAnimation(){
	var $progressBar = $('.progress-bar');
	$progressBar.stop()
	$('#progressBarId').removeClass("progress-striped");
}

//##############################################################

function disableAllButtons(){
	enableDisableButton(false,false,'openGate100ButtonId');
	enableDisableButton(false,false,'openGate50ButtonId');
	enableDisableButton(false,false,'closeGateButtonId');
	enableDisableButton(false,false,'toggleButtonId')
	enableDisableButton(false, false, 'togglePedestrianId')
	enableDisableButton(false, false, 'forceCloseGateButtonId')
	enableDisableButton(true, true, 'refreshButtonId')
	
}

function setErrorStatus(){
	disableAllButtons();
	stopStatusBarAnimation();
	hideStatusBar();
	$('#LoaderId').slideUp()
	clearInterval(gateToggleIntervalId);
	gateToggleIntervalId = 0;
}

//Define o status do portão, colocando um icon de acordo
//A100=Aberto, F=Fechado, "A50=Aberto 50%, A?=Aberto não definido
function displayGateStatus(gateClosedPercentage){
	text="";
	icon="";
	GateStatusImage = "";
	progressBarValue=0;
	progressBarColor="";
	
	if(gateClosedPercentage == 100){
		text = " Fechado";
			icon = "fa fa-lock";
			GateStatusImage = "closedDoorIcon2.png";
			progressBarValue=gateClosedPercentage;
			progressBarColor="success";
			
			enableDisableButton(true,true,'openGate100ButtonId');
			enableDisableButton(false,false,'openGate50ButtonId');
			enableDisableButton(false,false,'closeGateButtonId');
			enableDisableButton(false,false,'toggleButtonId')
			enableDisableButton(false, false, 'togglePedestrianId')
			enableDisableButton(false, false, 'forceCloseGateButtonId')
			enableDisableButton(false, false, 'refreshButtonId')			
						
			$('#GateStatus').addClass("redColor");
			$('#GateStatus').removeClass("greenColor");
			
			if($('#ProgressBarDisplayId').is(':visible') == true){			
				$('#ProgressBarDisplayId').slideUp();
			}
			$('#LoaderId').slideUp()
			
	}else if(gateClosedPercentage == 0){
			text = " Aberto";
			icon = "fa fa-unlock";
			GateStatusImage = "openDoorIcon2.png";
			progressBarValue=gateClosedPercentage;
			progressBarColor="success";
			
			enableDisableButton(false,false,'openGate100ButtonId');
			enableDisableButton(false,false,'openGate50ButtonId');
			enableDisableButton(true,true,'closeGateButtonId');
			enableDisableButton(false,false,'toggleButtonId')
			enableDisableButton(false, false, 'togglePedestrianId')
			enableDisableButton(false, false, 'forceCloseGateButtonId')
			enableDisableButton(false, false, 'refreshButtonId')
			
			$('#GateStatus').addClass("greenColor");
			$('#GateStatus').removeClass("redColor");
			
			if($('#ProgressBarDisplayId').is(':visible') == true){			
				$('#ProgressBarDisplayId').slideUp();
			}
			$('#LoaderId').slideUp()
			
	}else if (gateClosedPercentage > 0 &&  gateClosedPercentage < 100){
			text = " Aberto";
			GateStatusImage = "openDoorIcon2.png";
			icon = "fa fa-unlock-alt";
			progressBarValue=gateClosedPercentage;
			progressBarColor="success";
			
			enableDisableButton(true,true,'openGate100ButtonId');
			enableDisableButton(true,true,'openGate50ButtonId');
			enableDisableButton(true,true,'closeGateButtonId');
			enableDisableButton(true,true,'toggleButtonId')
			enableDisableButton(false, false, 'togglePedestrianId')
			enableDisableButton(false, false, 'forceCloseGateButtonId')
			enableDisableButton(false, false, 'refreshButtonId')
			
			$('#ProgressBarDisplayId').css("style","display:");
			$('#ProgressBarDisplayId').css("display","");
			$('#GateStatus').addClass("greenColor");
			$('#GateStatus').removeClass("redColor");
	}else if(gateClosedPercentage == -1){
			text = " Entre-Aberto";
			icon = "fa fa-unlock";
			GateStatusImage = "open50PercDoorIcon.png";
			progressBarValue=gateClosedPercentage;
			progressBarColor="success";
			
			enableDisableButton(false,false,'openGate100ButtonId');
			enableDisableButton(false,false,'openGate50ButtonId');
			enableDisableButton(false,false,'closeGateButtonId');
			enableDisableButton(true,true,'toggleButtonId')
			enableDisableButton(false, false, 'togglePedestrianId')
			enableDisableButton(false, false, 'refreshButtonId')
			//if(($('#LoaderId').is(":visible") == false) && 
			   //($('#ProgressBarDisplayId').is(':visible') == false || ($('#ProgressBarDisplayId').is(':visible') == true && $('#progressBarId').hasClass('progress-striped') == false))){
				//enableDisableButton(true, true, 'forceCloseGateButtonId')
			//}
			
			
			$('#GateStatus').removeClass("redColor");
			$('#GateStatus').removeClass("greenColor");
			//$('#GateStatus').addClass("orangeColor");
			//$('#ProgressBarDisplayId').slideUp();
		}else if(gateClosedPercentage == -2){
			text = " Em Movimento";
			icon = "fa fa-unlock";
			GateStatusImage = "open50PercDoorIcon.png";
			progressBarValue=gateClosedPercentage;
			progressBarColor="success";
			
			enableDisableButton(false,false,'openGate100ButtonId');
			enableDisableButton(false,false,'openGate50ButtonId');
			enableDisableButton(false,false,'closeGateButtonId');
			enableDisableButton(true,true,'toggleButtonId')
			enableDisableButton(false, false, 'togglePedestrianId')
			enableDisableButton(false, false, 'refreshButtonId')
			//if(($('#LoaderId').is(":visible") == false) && 
			   //($('#ProgressBarDisplayId').is(':visible') == false || ($('#ProgressBarDisplayId').is(':visible') == true && $('#progressBarId').hasClass('progress-striped') == false))){
				//enableDisableButton(true, true, 'forceCloseGateButtonId')
			//}
			
			
			$('#GateStatus').removeClass("redColor");
			$('#GateStatus').removeClass("greenColor");
			//$('#GateStatus').addClass("orangeColor");
			//$('#ProgressBarDisplayId').slideUp();
	}else{
			text = "Erro!!!";
			icon = "fa fa-exclamation-triangle";
			progressBarValue=0;
			progressBarDisplayValue = progressBarValue;
			progressBarColor="danger";
			
			disableAllButtons();
	}

	htmlStatus = '<img src="./img/'+GateStatusImage+'" style="width:50px;padding-bottom: 12px;">'+text				
	$("#GateStatus").html(htmlStatus);

	return htmlStatus;
}

//#############################################\\
// Get Temperatura e humidade

function getTemperatureHumidity(){
	$.ajax({
		url: ipURL+'/HouseTempHumid',
		type: 'GET',
		cache: false,
		headers: {
			"Authorization": serviceAuth
		},
		success:function(data){
			temperatura = data.temperature;
			if(temperatura <= 0 || temperatura >=60){
				temperatura = '-';
			}
			$("#TemperatureContainer").text(temperatura+" ºC")
			
		},
		error:function(data){
			$("#TemperatureContainer").text("? ºC")
			console.log("Erro na leitura de temperatura e humidade")
		}
	})
}

//#############################################\\
// Get Status do sistema

function getSystemStatus(isDisplayMachinesDown){
	$.ajax({
		url: ipURL+'/systemStatus',
		type: 'GET',
		cache: false,
		headers: {
			"Authorization": serviceAuth
		},
		success:function(data){
			isSystemAlive = data.isSystemAllAlive;
			if(isSystemAlive == true){
				$("#SystemNOKIcon").hide()
				$("#SystemOKIcon").show()
			}else{
				$("#SystemOKIcon").hide()
				$("#SystemNOKIcon").show()
				$("#systemsDownNumber").text(data.systemsDown)
				machinesDownText = "";
				machinesUpText = "";
				if(isDisplayMachinesDown == true){
					for (i = 0; i < data.Machines.length; i++) {
						if(data.Machines[i].Machine.isAlive == false){
							machinesDownText += data.Machines[i].Machine.IP+ "\n";
						}else{
							machinesUpText += data.Machines[i].Machine.IP+ "\n";
						}
					}
				if(machinesDownText != ""){
					machinesDownText = "Máquinas em baixo:\n"+machinesDownText;
				}
				if(machinesUpText != ""){
					machinesUpText = "Máquinas OK:\n"+machinesUpText;
				}
				alert(machinesDownText+"\n"+machinesUpText)
				}
			}
			
		},
		error:function(data){
			$("#SystemOKIcon").hide()
			$("#SystemNOKIcon").show()
			console.log("Erro na leitura de status de sistema")
		}
	})
}

//#############################################\\
// Get imagem da camera

function getCameraPicture(imageContainerID, imageSize, isClearImage){
	if(isClearImage == true){
		$(imageContainerID).attr("src", "");
	}	
	//$.ajaxSetup({ cache: false });
	$.ajax({
		url: ipURL+'/getGateCameraImage?Resolution='+imageSize,
		type: 'GET',
		cache: false,
		headers: {
			"Authorization": serviceAuth
		},
		 beforeSend: function (xhr) {
			xhr.overrideMimeType('text/plain; charset=x-user-defined');
		},
		success:function(data,textStatus, jqXHR){
			//$(imageContainerID).attr("src", "data:image/jpeg;base64");
			var binary = "";
			var responseText = jqXHR.responseText;
			var responseTextLen = responseText.length;
			for ( i = 0; i < responseTextLen; i++ ) {
				binary += String.fromCharCode(responseText.charCodeAt(i) & 255)
			}
			$(imageContainerID).attr("src", "data:image/jpeg;base64,"+btoa(binary));
			var dt = new Date();
			$("#GateImageTimeStamp").text(
			(dt.getHours()<10?'0':'') + dt.getHours() + ":" + 
			(dt.getMinutes()<10?'0':'') + dt.getMinutes() + ":" + 
			(dt.getSeconds()<10?'0':'') + dt.getSeconds());
		},
		error:function(data){
			console.log("Erro a carregar imagem")
		}
	})
}

//#############################################\\
// Retorna o status do portão
function getGateStatus(isUpdatePageStatus,statusGoalCheck){
		$.ajax({
			url: ipURL+'/gateStatus',
			dataType: 'json',
			type: 'GET',
			headers: {
				"Authorization": serviceAuth
			},
			timeout:3000,
			success: function(data) { 
				statusValue = data.statusFecho;
				if(isUpdatePageStatus == true){
					displayGateStatus(statusValue)
				}
				if(statusGoalCheck != undefined){
					if(statusValue == statusGoalCheck){
						showMessage('S','Estado do portão actualizado com sucesso',true)
					}
					else{showMessage('E','Estado do portão não actualizado',true)}
				}
				if(data.statusFecho == 100 || data.statusFecho == 0){					
					if($('#LoaderId').is(":visible") == true || $('#ProgressBarDisplayId').is(':visible') == true){
						showMessage('S','Estado do portão actualizado com sucesso',true);
					}
					stopStatusBarAnimation();
					clearInterval(gateToggleIntervalId);
					console.log("Terminada Interval"+gateToggleIntervalId)
					gateToggleIntervalId = 0;				
				}
				return statusValue;
			},
			error:   function(data,textStatus,errorThrown ){
				if(textStatus == 'timeout'){
					console.log('Erro: Timeout a verificar status do portão')
				}
				showMessage('E','Não foi possível verificar o estado do portão',false)
				setErrorStatus();
				console.log('Erro: Não foi possível verificar o estado do portão')
				
			}	
		});
}

//###########################################\\
//Mover o portão para uma determinada posição
function toggleGate(isStopToggle,GateStatusCurrent,GateStatusGoal,successCallBackFunction){
	$.ajax({
		url: ipURL+'/toggleGate',
		dataType: 'json',
		headers: {
			"Authorization": serviceAuth
		},
		type: 'GET',
		success:function(data){
			returnStatus = data.returnStatus;
			if(returnStatus == "OK"){
				if(isStopToggle == true){
					if(successCallBackFunction != undefined){
						successCallBackFunction();
						return 1;
					}					
				}
				//Abrir/Fechar Portão?
				if((GateStatusCurrent == 100 && GateStatusGoal == 0)||(GateStatusCurrent == 0 && GateStatusGoal == 100)){
					animateStatusBar(GateStatusCurrent,GateStatusGoal)
					
					//Vamos acompanhar o evoluir do estado, até atingirmos um estado definitivo (Aberto ou fechado)
										
				}
				checkGateStatus(GateStatusGoal)
			}else{
				setErrorStatus();
				getGateStatus(true);
				alert("Erro: Não foi possível comunicar com o portão");
			}
		},
		error: function(data){
			setErrorStatus();
			alert("Erro: Não foi possível comunicar com o portão");
		},
		timeout: 2000
	});	
}

//###################################\\
//       Acompanha estado do portão

//Acompanhar o estado do portão até chegar a um estado final (Aberto ou fechado)\\
//Loop para verificar o status do portão, durante 40segundos (20 execuções, 1 a cada 2 segundos)
function checkGateStatus(GateStatusGoal) {
	gateToggleIntervalId = setInterval(getGateStatusToggle, 2000); //Lança uma verificação a cada 2 segundos
	var countExecutions = 20;
	
	function getGateStatusToggle() {
		if (countExecutions == 0) {
			getGateStatus(true,GateStatusGoal);
			clearInterval(gateToggleIntervalId);
			gateToggleIntervalId = 0;
			stopStatusBarAnimation();
			hideStatusBar();
			console.log("Terminada verificação de status(Count="+countExecutions+")")			
		}else {			
			getGateStatus(true);
			countExecutions--; 
		}
	}
}

//#####################################\\
//         Acções de Botões

function openGate(){
	enableDisableButton(false,false,'openGate100ButtonId');
	enableDisableButton(true,true,'toggleButtonId')
	enableDisableButton(false, false, 'togglePedestrianId')
	toggleGate(false,100,0)
}

function closeGate(){
	toggleGate(false,0,100)
	enableDisableButton(false,false,'closeGateButtonId');
	enableDisableButton(true,true,'toggleButtonId');
}

function openPedestrianGate(){
	showMessage("W","Funcionalidade ainda não disponível",true)
	//operateGate(50);
}

function forceCloseGate(){
	showMessage("W","Funcionalidade ainda não disponível",true)
}

function refresh(){
	getGateStatus(true);
}

function toggleGateSimple(){
	enableDisableButton(false, false, 'forceCloseGateButtonId');
	//toggleGate(true,0,0); //Com isto vamos fazer um simples toggle
	
	//Se a barra ou circulo de loading estiver activo, mandamos pará-los
	if($('#LoaderId').is(":visible") == true || $('#progressBarId').hasClass("progress-striped") == true){
		//Com isto vamos fazer um simples toggle para parar
		toggleGate(true,0,0, function(){
			console.log("CallBackFunction= OK")
			stopStatusBarAnimation();
			$('#LoaderId').slideUp()
			clearInterval(gateToggleIntervalId);
			gateToggleIntervalId = 0;
			getGateStatus(true);			
			//enableDisableButton(true, true, 'forceCloseGateButtonId')
		});
	}else{// Activamos a barra de loading, e ficamos a acompanhar o evoluir do portão
		toggleGate(false,0,0);
		$('#ProgressBarDisplayId').slideUp();
		$('#LoaderId').slideDown()
		enableDisableButton(false, false, 'forceCloseGateButtonId')
	}
}

function setModalImage(isRefreshImage){
	var modal = document.getElementById('myModal');
	var modalImg = document.getElementById("modalImage");
	var captionText = document.getElementById("caption");
	modal.style.display = "block";
	
	getCameraPicture('#modalImage','800*600',true );
	
	if(isRefreshImage == true){
		modalImageLoopIntervalId = setInterval(function() {
			getCameraPicture('#modalImage','800*600',false );
		}, 3000);
	}
}

function closeModalImage(){
	var modal = document.getElementById('myModal');
	clearInterval(modalImageLoopIntervalId);
	modalImageLoopIntervalId = 0;
	modal.style.display = "none";
}

function detectmob() {
	var ScreenWidth = 0;
	var ScreenHeight = 0;
	
	ScreenWidth = window.innerWidth;
	ScreenHeight = window.innerHeight;
	
	if(window.innerWidth > window.innerHeight){
		ScreenWidth = window.innerHeight;
		ScreenHeight = window.innerWidth;
	}

   if(ScreenWidth <=500) {
     return true;
   } else {
     return false;
   }
}

$(document).ready(function() {
	var isMobile = detectmob();
	
	getGateStatus(true);	
	getTemperatureHumidity();
	getSystemStatus(false);	
	if(isMobile == false){
		getCameraPicture('#CameraImageSRC','264*216',false);
	}
	
	getNetworkLocation();

	if(isMobile == false){	
		//Actualiza a imagem da câmera a cada 3 segundos
		setInterval(function() {
			getCameraPicture('#CameraImageSRC','264*216',false);
		}, 3000);
	}
	
	//Actualiza a temperatura a cada 5 minutos
	setInterval(function() {
		getTemperatureHumidity();
	}, 300000);
	//Actualiza Status do sistema a cada 10 minutos
	setInterval(function() {
		getSystemStatus(false);
	}, 600000);
	
});

function changeURL(url){
	ipURL = url;
}
