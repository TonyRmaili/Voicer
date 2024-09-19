from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import openai
from LLM_text.system_prompt import teacher, therapist, chef, personal_trainer


class LLMTexter:
    def __init__(self,role,user):
        load_dotenv()

        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # define the paths using os.çpath.join for platform-independent path construction
        self.json_path = os.path.join(".", "json_log")
        self.user = user
        self.full_path = os.path.join(self.json_path, self.user, f"{role}.json")

        # models
        self.model_gpt_4o_mini = "gpt-4o-mini"

        # hard defined assistant roles. Defaults to personal assistant
       
        if role =="teacher":
            self.role = teacher

        elif role =="therapist":
            self.role = therapist

        elif role =="chef":
            self.role = chef

        elif role =="personal_trainer":
            self.role = personal_trainer
                
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
    llm_texter = LLMTexter(role="teacher",user="tony")
    
    # resp = llm_texter.conversation(prompt="give me a math equation to solve.")
    # print(resp)
    
    print(llm_texter.role)