//получить ключ
function getActiveTokensCall() {
    blockScreen();
	getActiveTokens("getActiveTokensBack");
}
//получить ключ(вывод)
function getActiveTokensBack(result) {
    unblockScreen();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var listOfTokens = result['responseObject'];        
        $('#storageSelect').empty();
        $('#storageSelect').append('<option value="PKCS12">PKCS12</option>');
        for (var i = 0; i < listOfTokens.length; i++) {
            $('#storageSelect').append('<option value="' + listOfTokens[i] + '">' + listOfTokens[i] + '</option>');
        }
    }
}
//получить информацию из ключа
function getKeyInfoCall() {
    blockScreen();
    var selectedStorage = $('#storageSelect').val();
    getKeyInfo(selectedStorage, "getKeyInfoBack");
}
//получить информацию из ключа(вывод)
function getKeyInfoBack(result) {
    unblockScreen();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];

        var alias = res['alias'];
        $("#alias").val(alias);

        var keyId = res['keyId'];
        $("#keyId").val(keyId);

        var algorithm = res['algorithm'];
        $("#algorithm").val(algorithm);

        var subjectCn = res['subjectCn'];
        $("#subjectCn").val(subjectCn);

        var subjectDn = res['subjectDn'];
        $("#subjectDn").val(subjectDn);

        var issuerCn = res['issuerCn'];
        $("#issuerCn").val(issuerCn);

        var issuerDn = res['issuerDn'];
        $("#issuerDn").val(issuerDn);

        var serialNumber = res['serialNumber'];
        $("#serialNumber").val(serialNumber);

        var dateString = res['certNotAfter'];
        var date = new Date(Number(dateString));
        $("#notafter").val(date.toLocaleString());

        dateString = res['certNotBefore'];
        date = new Date(Number(dateString));
        $("#notbefore").val(date.toLocaleString());

        var authorityKeyIdentifier = res['authorityKeyIdentifier'];
        $("#authorityKeyIdentifier").val(authorityKeyIdentifier);

        var pem = res['pem'];
        $("#pem").val(pem);

        PutEDSPrintInfoToServer();
    }
}
window.requestAndSignXml = function (recordId) {
    blockScreen();
    InitNCALayer();
    $.get("/Files/GetXmlToSign", { id: recordId })
        .done(function (data) {

            if (!data || !data.xml) {
                unblockScreen();
                alert("XML не получен");
                return;
            }
            var xmlToSign = data.xml
            var selectedStorage = "PKCS12";
            setTimeout(function () {
                signXml(selectedStorage, "SIGNATURE", xmlToSign, "receiveSignedXmlCallback");
            }, 500);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            unblockScreen();
            console.error("AJAX ошибка:", jqXHR, textStatus, errorThrown);
            alert("Ошибка запроса XML с сервера: " + jqXHR.status + " " + textStatus);
        });
};

window.receiveSignedXmlCallback = function (result) {
    unblockScreen();
    if (!result) {
        alert("Ошибка подписи");
        return;
    }
    if (result['code'] === "500") {
        alert(result['message']);
        return;
    }
    if (result['code'] === "200") {
        var signedXml = result['responseObject'];
        if (!signedXml) {
            alert("Подписанный XML пустой");
            return;
        }
        if (typeof $ === "undefined" || !$.ajax) {
            alert("jQuery не загружен!");
            return;
        }
        $(function () {
            $.ajax({
                url: "/Files/ReceiveSignedXml",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ signedXml: signedXml }),
                success: function (resp) {
                    alert(resp.message || "Подписанный XML успешно отправлен");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Ошибка AJAX:", jqXHR, textStatus, errorThrown);
                    alert("Ошибка отправки подписанного XML на сервер");
                }
            });
        });
    }
};
//подписать xml
function signXmlCall() {
    var xmlToSign = $("#xmlToSign").val();
    var selectedStorage = $('#storageSelect').val();
    blockScreen();
    signXml(selectedStorage, "SIGNATURE", xmlToSign, "signXmlBack");
}
//подписать xml(вывод)
function signXmlBack(result) {
	unblockScreen();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#signedXml").val(res);
    }
}
//подписать несколько xml
function signXmlsCall() {
    var xmlToSign1 = $("#xmlToSign1").val();
	var xmlToSign2 = $("#xmlToSign2").val();
	var xmlsToSign = new Array(xmlToSign1, xmlToSign2);
	var selectedStorage = $('#storageSelect').val();
	blockScreen();
	signXmls(selectedStorage, "SIGNATURE", xmlsToSign, "signXmlsBack");
}
//подписать несколько xml(вывод)
function signXmlsBack(result) {
	unblockScreen();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#signedXml1").val(res[0]);
		$("#signedXml2").val(res[1]);
    }
}
//подписать файл
function createCAdESFromFileCall() {
    var selectedStorage = $('#storageSelect').val();
    var flag = $("#flag").is(':checked');
    var filePath = $("#filePath").val();
    if (filePath !== null && filePath !== "") {
		blockScreen();
        createCAdESFromFile(selectedStorage, "SIGNATURE", filePath, flag, "createCAdESFromFileBack");
    } else {
        alert("Не выбран файл для подписи!");
    }
}
//подписать файл(вывод)
function createCAdESFromFileBack(result) {
	unblockScreen();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#createdCMS").val(res);
    }
}
//подписать Base64
function createCAdESFromBase64Call() {
    var selectedStorage = $('#storageSelect').val();
    var flag = $("#flagForBase64").is(':checked');
    var base64ToSign = $("#base64ToSign").val();
    if (base64ToSign !== null && base64ToSign !== "") {
		$.blockUI();
        createCAdESFromBase64(selectedStorage, "SIGNATURE", base64ToSign, flag, "createCAdESFromBase64Back");
    } else {
        alert("Нет данных для подписи!");
    }
}
//подписать Base64(вывод)
function createCAdESFromBase64Back(result) {
	$.unblockUI();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#createdCMSforBase64").val(res);
    }
}
//подписать Base64 Hash
function createCAdESFromBase64HashCall() {
    var selectedStorage = $('#storageSelect').val();
    var base64ToSign = $("#base64HashToSign").val();
    if (base64ToSign !== null && base64ToSign !== "") {
		$.blockUI();
        createCAdESFromBase64Hash(selectedStorage, "SIGNATURE", base64ToSign, "createCAdESFromBase64HashBack");
    } else {
        alert("Нет данных для подписи!");
    }
}
//подписать Base64 Hash(вывод)
function createCAdESFromBase64HashBack(result) {
	$.unblockUI();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#createdCMSforBase64Hash").val(res);
    }
}
//Приложить метку времени к подписи CMS
function applyCAdESTCall() {
    var selectedStorage = $('#storageSelect').val();
    var cmsForTS = $("#CMSForTS").val();
    if (cmsForTS !== null && cmsForTS !== "") {
		$.blockUI();
        applyCAdEST(selectedStorage, "SIGNATURE", cmsForTS, "applyCAdESTBack");
    } else {
        alert("Нет данных для подписи!");
    }
}
//Приложить метку времени к подписи CMS(вывод)
function applyCAdESTBack(result) {
	$.unblockUI();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#createdCMSWithAppliedTS").val(res);
    }
}
//Выбрать файл для подписи(вывод)
function showFileChooserCall() {
    blockScreen();
    showFileChooser("ALL", "", "showFileChooserBack");
}
//Выбрать файл для подписи
function showFileChooserBack(result) {
    unblockScreen();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#filePath").val(res);
    }
}
//Выбрать файл для подписи с меткой времени
function showFileChooserForTSCall() {
    blockScreen();
    showFileChooser("ALL", "", "showFileChooserForTSBack");
}
//Выбрать файл для подписи с меткой времени(вывод)
function showFileChooserForTSBack(result) {
    unblockScreen();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#filePath").val(res);
    }
}

function changeLocaleCall() {
    var selectedLocale = $('#localeSelect').val();
    changeLocale(selectedLocale);
}
//подписать файл с меткой времени
function createCMSSignatureFromFileCall() {
    var selectedStorage = $('#storageSelect').val();
    var flag = $("#flagForCMSWithTS").is(':checked');
    var filePath = $("#filePath").val();
    if (filePath !== null && filePath !== "") {
		blockScreen();
        createCMSSignatureFromFile(selectedStorage, "SIGNATURE", filePath, flag, "createCMSSignatureFromFileBack");
    } else {
        alert("Не выбран файл для подписи!");
    }
}
//подписать файл с меткой времени(вывод)
function createCMSSignatureFromFileBack(result) {
	unblockScreen();
    if (result['code'] === "500") {
        alert(result['message']);
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#createdCMS").val(res);
    }
}
//подписать Base64 с меткой времени
function createCMSSignatureFromBase64Call() {
    var selectedStorage = $('#storageSelect').val();
    var flag = $("#flagForBase64WithTS").is(':checked');
    var base64ToSign = $("#base64ToSignWithTS").val();
    if (base64ToSign !== null && base64ToSign !== "") {
		$.blockUI();
        createCMSSignatureFromBase64(selectedStorage, "SIGNATURE", base64ToSign, flag, "createCMSSignatureFromBase64Back");
    } else {
        alert("Нет данных для подписи!");
    }
}

//подписать Base64 с меткой времени
function createEDSCall() {
    setTimeout(
        function () {
            if (webSocket.readyState === 1) {
                var selectedStorage = 'PKCS12';
                var flag = true;
                var base64ToSign = $("#base64ToSign").val();
                $("#CMSReady").val('0');
                if (base64ToSign !== null && base64ToSign !== "") {
                    blockScreen();
                   createCMSSignatureFromBase64(selectedStorage, "SIGNATURE", base64ToSign, flag, "createCMSSignatureFromBase64Back");
           //         createCMSSignatureFromBase64(selectedStorage, "AUTHENTICATION", base64ToSign, flag, "createCMSSignatureFromBase64Back");
                    // Проверил сертификат AUTH, работает, в нём содержится нужная информация о том, кто входит в кабинет. Можно использовать как для компаний, так и для выгодоприобретателей
                }
            } else if (webSocket.readyState === 0) {
                createEDSCall();
            }

        }, 5);
}
//подписать Base64 с меткой времени(вывод)
function createCMSSignatureFromBase64Back(result) {
    if (result['code'] === "500") {
        alert(result['message']);
        $("#createdCMSforBase64").val('');
        $("#CMSReady").val('2');
        $.unblockUI();
    } else if (result['code'] === "200") {
        var res = result['responseObject'];
        $("#createdCMSforBase64").val(res);
        $("#CMSReady").val('1');
        SendESDInfoToServer();
        $.unblockUI();
        //InitPage();
    }
    //__doPostBack();
   
    

    

}

function PutEDSPrintInfoToServer() {
    $.ajax({
        url: '/Files/PutEDSInfo',
        type: "post",
        data: {
            recordid: getURLParameter('id'),
            tableid: getURLParameter('tableid'),
            mnu: getURLParameter("mnu"),
            CMSReady: $("#CMSReady").val(),
            base64ToSign: $("#base64ToSign").val(),
            alias: $("#alias").val(),
            edscertno: $("#edscertno").val(),
            keyId: $("#keyId").val(),
            algorithm: $("#algorithm").val(),
            subjectCn: $("#subjectCn").val(),
            subjectDn: $("#subjectDn").val(),
            issuerCn: $("#issuerCn").val(),
            issuerDn: $("#issuerDn").val(),
            serialNumber: $("#serialNumber").val(),
            notafter: $("#notafter").val(),
            notbefore: $("#notbefore").val(),
            authorityKeyIdentifier: $("#authorityKeyIdentifier").val(),
            pem: $("#pem").val()
        },
        success: function (d, t, x) {
            if ((d.indexOf('#') > 0 || d.indexOf('id') > 0) && d.indexOf('SetErrorText') < 0 && d.indexOf('Core_HandleExceptionError') < 0 && d.indexOf('CreateWithRedirect') < 0) {
                getNewTost(d, "error");
            }
        },
        error: function (a, b, c) {
            if (b == "timeout") {
                getNewTost('Истекло время ожидания запроса', 'error');
            };
        }
    });
}

function SendESDInfoToServer() {
  /*  $.get('/Global/ProcessEDSResult', {
        recordid: getURLParameter('id'),
        tableid: getURLParameter('tableid'),
        mnu: getURLParameter("mnu"),
        createdCMSforBase64: $("#createdCMSforBase64").val(),
        CMSReady: $("#CMSReady").val(),
        base64ToSign: $("#base64ToSign").val(),
        fileName: $("#fileName").val(),
        docsType: $("#docsType").val()
    },
        function (data) {
            alert(data);
        }
    );*/

    $.ajax({
        url: '/Files/ProcessEDSResult',
        type: "post",
        data: {
            recordid: getURLParameter('id'),
            tableid: getURLParameter('tableid'),
            mnu: getURLParameter("mnu"),
            createdCMSforBase64: $("#createdCMSforBase64").val(),
            CMSReady: $("#CMSReady").val(),
            base64ToSign: $("#base64ToSign").val(),
            fileName: $("#fileName").val(),
            docsType: $("#docsType").val(),
            attachid: $('#curattachid').val()
        },
        success: function (d, t, x) {
            if (d != "null") {
                if (d.indexOf('success') >= 0) {
                    CompleteUpdateMainAttach();
                    getNewTost('Документ успешно подписан ЭЦП');
                 //   InitPage();
                }
                else {
                    //   $('#submitModal').removeClass("processing");
                      getNewTost(d, 'error');
                }
                //$('#modal .modal-content').html(d);
            } else {
                getNewTost('Произошел сбой при отправке результата подписи на сервер...', 'warning');
            }
        },
        error: function (a, b, c) {
            if (b == "timeout") {
                getNewTost('Истекло время ожидания запроса', 'error');
            };
        }
    });

}


