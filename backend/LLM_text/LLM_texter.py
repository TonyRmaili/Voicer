from openai import OpenAI
from dotenv import load_dotenv
import os
import json



class LLMTexter:
    def __init__(self,role,user):
        load_dotenv()

        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        # define the paths
        self.json_path = "./json_log/"
        self.user = user +"/"
        self.full_path = self.json_path + self.user + role+".json"

        # models
        self.model_gpt_4o_mini = "gpt-4o-mini"

        # hard defined assistant roles. Defaults to personal assistant
       
        if role =="teacher":
            self.role = {"role":"system","content":"You are my personal teacher."}

        elif role =="therapist":
            self.role = {"role":"system","content":"You are my personal therapist."}
                
        else:
            self.role = {"role":"system","content":"You are my personal assistant."}


        # init conversation log
        self.load_json_conversation()

    def load_json_conversation(self):
        os.makedirs(os.path.dirname(self.full_path), exist_ok=True)

        # Check if the file exists
        if not os.path.exists(self.full_path):
            # Create an empty JSON file with the correct name
            with open(self.full_path, "w") as f:
                json.dump([self.role], f)  # Dump an empty dictionary or any default structure
            print(f"Created new JSON file: {self.full_path}")
            
        try:
            # Open and load the existing JSON file
            with open(self.full_path, "r") as f:
                log = json.load(f)
            self.log = log

        except Exception as e:
            print("Something went wrong while loading the JSON file:", e)
            return None  # Return None or any default value you prefer

    def save_json_conversation(self):
        with open(self.full_path, "w") as f:
            json.dump(self.log, f,indent=4)

    def conversation(self,prompt):
        prompt = {"role":"user","content":prompt}

        self.log.append(prompt)

        response = self.client.chat.completions.create(
            model=self.model_gpt_4o_mini,
            messages=self.log
        )


        response = response.choices[0].message.content

        to_json_resp = {"role":"assistant","content":response}
        self.log.append(to_json_resp)
        self.save_json_conversation()
        return response


if __name__=="__main__":
    llm_texter = LLMTexter(role="therapist",user="pavan")
    
    resp = llm_texter.conversation(prompt="i feel better now, thank you")
    print(resp)
    