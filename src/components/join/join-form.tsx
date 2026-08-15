"use client";



import { useActionState } from "react";

import { ActionButton } from "@/components/ui/action-control";

import {

  alertErrorClassName,

  alertInfoClassName,

  alertSuccessClassName,

  inputClassName,

  labelClassName,

  panelClassName,

} from "@/lib/utils";

import { joinActionInitialState } from "@/lib/sessions";

import { joinByStudentId } from "@/server/actions/sessions";



type JoinFormProps = {

  quizTitle?: string;

  quizRunning: boolean;

};



export function JoinForm({ quizTitle, quizRunning }: JoinFormProps) {

  const [state, formAction, isPending] = useActionState(

    joinByStudentId,

    joinActionInitialState,

  );



  return (

    <form action={formAction} className={`${panelClassName} space-y-5`}>

      {quizRunning && quizTitle ? (

        <p className={alertSuccessClassName}>

          Live quiz: <strong>{quizTitle}</strong>

        </p>

      ) : null}



      {!quizRunning ? (

        <p className={alertInfoClassName}>

          No quiz is running right now. Wait for your teacher to launch one.

        </p>

      ) : (

        <>

          <div className="space-y-2">

            <label htmlFor="studentId" className={labelClassName}>

              Student ID

            </label>

            <input

              id="studentId"

              name="studentId"

              type="text"

              required

              autoComplete="off"

              autoCapitalize="off"

              spellCheck={false}

              placeholder="Enter your ID"

              className={inputClassName}

            />

          </div>



          {state.error ? (

            <p role="alert" className={alertErrorClassName}>

              {state.error}

            </p>

          ) : null}



          <ActionButton

            action="join"

            type="submit"

            disabled={isPending}

            className="w-full"

            label={isPending ? "Joining..." : "Join quiz"}

          />

        </>

      )}

    </form>

  );

}


