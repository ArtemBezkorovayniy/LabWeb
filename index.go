package main

import (
	//"fmt"
	
	"encoding/json"
	"html/template"
	"project1/models"
	"net/http"

	"github.com/gorilla/mux"
	
)

var db models.DB

func main() {
	db = models.DB{}
	db.Open()
	r := mux.NewRouter()
	r.HandleFunc("/", IndexHandler).Methods("GET")
	r.HandleFunc("/add", AddHandler).Methods("POST")
	r.HandleFunc("/delete", DeleteHandler).Methods("POST")
	r.HandleFunc("/getlist", GetListHandler).Methods("POST")
	r.HandleFunc("/transaction/{id}", transactionHandler).Methods("GET")
	
	//r.PathPrefix("/static/").Handler(http.FileServer(http.Dir("./")))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))

	http.Handle("/", r)
	http.ListenAndServe(":1111", nil)
	db.Close()
}

func IndexHandler(w http.ResponseWriter, r *http.Request) {

	tmpl, _ := template.ParseFiles("index.html")
	tmpl.ExecuteTemplate(w, "index.html", nil)
}

func GetListHandler (w http.ResponseWriter, r *http.Request) {
	var trList = db.GetList()
	temp, _ := json.Marshal(trList)
	w.Write(temp)
}

func AddHandler(w http.ResponseWriter, r *http.Request) {
	transaction := models.Transaction{}
	json.Unmarshal([]byte(r.FormValue("sendedData")), &transaction)
	ID := db.AddTransaction(transaction)
	w.Write([]byte(ID))
}

func DeleteHandler(w http.ResponseWriter, r *http.Request) {
	db.DeleteTransaction(r.FormValue("sendedData"))
}

func transactionHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	ID := vars["id"]
	transaction := db.GetTransaction(ID)
	tmpl, _ := template.ParseFiles("transaction.html")
	tmpl.ExecuteTemplate(w, "transaction.html", transaction)
}
