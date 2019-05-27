package models

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DB struct {
	Client *mongo.Client
}

func (db *DB) Open() {
	var err error
	db.Client, err = mongo.NewClient(options.Client().ApplyURI("mongodb://127.0.0.1:27017"))
	if err != nil {
		log.Fatal(err)
	}
	err = db.Client.Connect(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to MongoDB!")
	
	//clear collection
	collection := db.Client.Database("test").Collection("Transaction")	
	collection.DeleteMany(context.Background(), bson.D{})
}

func (db *DB) AddTransaction(transaction Transaction) string {
	fmt.Println(transaction)
	collection := db.Client.Database("test").Collection("Transaction")	
	insertResult, err := collection.InsertOne(context.Background(), transaction)
	if err != nil {
		log.Fatal(err)
	}
	ID := insertResult.InsertedID.(primitive.ObjectID)

	//save real id while we can...
	filter := bson.D{{"_id", ID}}
	update := bson.D{{ "$set", bson.D{{"dbid", ID}} }}
	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		log.Fatal(err)
	}
	return ID.Hex()
}

func (db *DB) DeleteTransaction(ID string) {
	collection := db.Client.Database("test").Collection("Transaction")	
	doc1 := bson.D{{"id", ID}}
	_, err := collection.DeleteOne(context.Background(), doc1)
	if err != nil {
		log.Fatal(err)
	}
}

func (db *DB) GetTransaction(ID string) Transaction {
	id, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		log.Fatal(err)
	}
	collection := db.Client.Database("test").Collection("Transaction")
	transaction := Transaction{}
	filter := bson.D{{"_id", id}}
	collection.FindOne(context.Background(), filter).Decode(&transaction)
	return transaction
}

func (db *DB) GetList() []*Transaction {
	option := options.Find()
	filter := bson.M{}
	results := []*Transaction{}
	collection := db.Client.Database("test").Collection("Transaction")
	cur, err := collection.Find(context.Background(), filter, option)
	if err != nil {
		log.Fatal(err)
	}
	
	for cur.Next(context.Background()) {
		elem := Transaction{}
		err := cur.Decode(&elem)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, &elem)
	}
	
	if err := cur.Err();err != nil {
		log.Fatal(err)
	}
	
	cur.Close(context.Background())
	return results;
}
 
func (db *DB) Close() {
	err := db.Client.Disconnect(context.Background())
	if err != nil {
		log.Fatal(err)
	}
}
