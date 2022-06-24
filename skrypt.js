'use strict'

const formEl = document.querySelector('#user-form');

/*************************** Pobranie i uzupełnienie danych dla pól Wykształcenie i Zawód ************************************/
fillInFormData ("jobs", "job", "job_id", "job");
fillInFormData ("educations", "education", "education_id", "education");

/********************************* Funkcja sprawdzająca przy próbie wysłania formularza ****************************************/
formEl.addEventListener('submit', async function (e) {
    // Formularz nie wysyła się automatycznie
    e.preventDefault();

    // Czy dane w formularzu są uzupełnione
    let isFormValid = true;

    // Element pokazujący status
    const statusEl = this.querySelector('#status');

    // Sprawdzenie elementów wymaganych (klasa required)
    const requiredElems = this.getElementsByClassName('required');

    for (let elem of requiredElems) {
        let errorEl = elem.parentElement.querySelector('.error');

        if (!elem.value.trim()) {
            errorEl.textContent = "To pole nie może być puste";
            isFormValid = false;
        } else {
            errorEl.textContent = "";
        }
    }

    // Jeśli dane są nieuzupełnione, to przerywa
    if (!isFormValid) {
        statusEl.textContent = "Uzupełnij pola";
        return;
    }

    const myFormData = new FormData(e.target);   
    const formDataObj = {};
    myFormData.forEach((value, key) => (formDataObj[key] = value));
    
    let response = await fetchData ("users", "POST", formDataObj);

    if (response.success) {
        statusEl.textContent = "";

        formEl.reset();
        formEl.style.display = 'none';

        let infoEl = document.querySelector('#info');
        infoEl.textContent = "Dziękujemy, zgłoszenie zostało wysłane.";

    } else {
        // Jeśli błąd dotyczy konkretnego pole w formularzu, to opis pojawia się przy tym polui
        if (response?.data?.code) {
            let inputEl = document.querySelector('input[name=' + response.data.code + ']');
            let errorEl = inputEl.parentElement.querySelector('.error');
            errorEl.textContent = response?.data?.description;
            statusEl.textContent = "Wystąpił bład!";

        } else {
            statusEl.textContent = response?.data?.description;
        }
    }
});

/*************************** Wypełnienie elementów Select na podstawie danych słownikowych ************************************/
async function fillInFormData (functionName, selectId, optionValue, optionText) {
    // Wskazanie właściwego elementu Select, na podstawie nazwy
    const selectEl = formEl.querySelector('select#' + selectId);

    // Pobranie danych słownikowych do odpowiednego pola
    let response = await fetchData (functionName, "GET");

    if (!response.success) return;

    // Stworzenie elementu Option z odpowiednimi wartościami dla wybranego elementu Select
    for (let obj of response.data) {
        var optionEl = document.createElement("option");
        optionEl.value = obj[optionValue];
        optionEl.text = obj[optionText];
        selectEl.add (optionEl);
    }
}

/*********************************************** Wysłanie danych na serwer ***************************************************/
async function fetchData (functionName, method, obj) {
    const url = "https://ewf-sample-api.h1.pl/";

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    };
    
    let result = await fetch(url + functionName, {
        headers: headers,
        method: method,
        crossDomain: true,
        body: obj?JSON.stringify(obj):null,
    });

    let data;
    try {
        data = await result.json();
    }
    catch (e) {
        data = "";
    }

    if (result.status == 200) return ({success: true, data:data});      // Jeśli wykonało się poprawnie
    else return ({success: false, data:data});                          // Jeśli wystąpił błąd
}
