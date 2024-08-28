from openai import OpenAI
from dotenv import load_dotenv
import os


class TextToLLM:
    def __init__(self) -> None:
        load_dotenv()
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )

        self.model_gpt_4o_mini = "gpt-4o-mini"
        self.system_prompt_teacher = {
            "role": "system", "content":"You are my personal teacher."
        }

    def question(self,question):
        messages = [
            self.system_prompt_teacher,
            {"role":"user","content":question}
        ]


        response = self.client.chat.completions.create(
            model=self.model_gpt_4o_mini,
            messages=messages
        )

        response = response.choices[0].message.content
        return response
    




if __name__ == "__main__":
    tt_llm = TextToLLM()
    response = tt_llm.question(question="What is pythagoras formula? only show me the equation")
    print(response)