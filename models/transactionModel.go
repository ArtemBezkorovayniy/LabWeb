package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Transaction struct {
	DBID         primitive.ObjectID 
	Sender       string
	Month        string
	Year      	 string
	CVV       	 string
	Receiver     string
	Money 		 string
	Commission   string
	ID           string
}
