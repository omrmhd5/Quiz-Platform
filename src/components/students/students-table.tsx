"use client";



import { useActionState, useEffect, useMemo, useState } from "react";

import type { StudentActionState } from "@/lib/students";

import {

  alertErrorClassName,

  cn,

  emptyStateClassName,

  inputClassName,

  labelClassName,

  panelClassName,

  tableBodyClassName,

  tableCellClassName,

  tableClassName,

  tableHeadCellClassName,

  tableHeadClassName,

  tableHeadRowClassName,

  tableShellClassName,

} from "@/lib/utils";

import { ConfirmDialog } from "@/components/confirm-dialog";

import { PaginationControls } from "@/components/pagination-controls";

import { SectionIntro } from "@/components/section-intro";

import { TableCell, TableRow } from "@/components/data-table";

import { ActionButton, ActionLink } from "@/components/ui/action-control";

import { STUDENTS_PAGE_SIZE, paginateSlice } from "@/lib/pagination";

import { deleteStudent, updateStudent } from "@/server/actions/students";



type Student = {

  id: string;

  name: string;

  createdAt: Date;

};



type StudentsTableProps = {

  students: Student[];

};



export function StudentsTable({ students }: StudentsTableProps) {

  const [query, setQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);



  const filteredStudents = useMemo(() => {

    const normalizedQuery = query.trim().toLowerCase();



    if (!normalizedQuery) {

      return students;

    }



    return students.filter(

      (student) =>

        student.id.toLowerCase().includes(normalizedQuery) ||

        student.name.toLowerCase().includes(normalizedQuery),

    );

  }, [query, students]);



  useEffect(() => {

    setPage(1);

  }, [query]);



  const pagination = useMemo(

    () => paginateSlice(filteredStudents, page, STUDENTS_PAGE_SIZE),

    [filteredStudents, page],

  );



  return (

    <div className={`${panelClassName} space-y-4`}>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

        <SectionIntro

          title="Student roster"

          description={`${students.length} registered · ${filteredStudents.length} shown`}

          className="mb-0"

        />



        <div className="w-full sm:max-w-xs">

          <label htmlFor="student-search" className={labelClassName}>

            Search students

          </label>

          <input

            id="student-search"

            type="search"

            value={query}

            onChange={(event) => setQuery(event.target.value)}

            placeholder="ID or name"

            className={cn(inputClassName, "mt-2")}

          />

        </div>

      </div>



      {filteredStudents.length === 0 ? (

        <p className={emptyStateClassName}>

          {students.length === 0

            ? "No students yet. Add one above or import a list."

            : "No students match your search."}

        </p>

      ) : (

        <div className="space-y-4">

          <PaginationControls

            page={pagination.page}

            pageCount={pagination.pageCount}

            totalItems={filteredStudents.length}

            pageSize={STUDENTS_PAGE_SIZE}

            onPageChange={setPage}

          />



          <div className={tableShellClassName}>

            <table className={tableClassName}>

              <thead className={tableHeadClassName}>

                <tr className={tableHeadRowClassName}>

                  <th scope="col" className={tableHeadCellClassName}>

                    ID

                  </th>

                  <th scope="col" className={tableHeadCellClassName}>

                    Name

                  </th>

                  <th scope="col" className={tableHeadCellClassName}>

                    Actions

                  </th>

                </tr>

              </thead>

              <tbody className={tableBodyClassName}>

                {pagination.items.map((student) =>

                  editingId === student.id ? (

                    <EditStudentRow

                      key={student.id}

                      student={student}

                      onCancel={() => setEditingId(null)}

                      onSaved={() => setEditingId(null)}

                    />

                  ) : (

                    <TableRow key={student.id}>

                      <TableCell className="font-mono text-zinc-900">

                        {student.id}

                      </TableCell>

                      <TableCell className="text-zinc-900">

                        {student.name}

                      </TableCell>

                      <TableCell>

                        <div className="flex flex-wrap gap-2">

                          <ActionLink

                            action="history"

                            href={`/teacher/students/${student.id}/history`}

                            compact

                          />

                          <ActionButton

                            action="edit"

                            compact

                            onClick={() => setEditingId(student.id)}

                          />

                          <DeleteStudentButton

                            studentId={student.id}

                            studentName={student.name}

                          />

                        </div>

                      </TableCell>

                    </TableRow>

                  ),

                )}

              </tbody>

            </table>

          </div>



          <PaginationControls

            page={pagination.page}

            pageCount={pagination.pageCount}

            totalItems={filteredStudents.length}

            pageSize={STUDENTS_PAGE_SIZE}

            onPageChange={setPage}

          />

        </div>

      )}

    </div>

  );

}



function EditStudentRow({

  student,

  onCancel,

  onSaved,

}: {

  student: Student;

  onCancel: () => void;

  onSaved: () => void;

}) {

  const boundUpdate = updateStudent.bind(null, student.id);

  const [state, formAction, isPending] = useActionState<

    StudentActionState,

    FormData

  >(boundUpdate, {});



  useEffect(() => {

    if (state.success) {

      onSaved();

    }

  }, [state.success, onSaved]);



  return (

    <TableRow>

      <TableCell className="font-mono text-zinc-900">{student.id}</TableCell>

      <TableCell colSpan={2}>

        <form action={formAction} className="flex flex-col gap-2 sm:flex-row">

          <input

            name="name"

            type="text"

            defaultValue={student.name}

            required

            className={inputClassName}

          />

          <div className="flex gap-2">

            <ActionButton

              action="save"

              type="submit"

              disabled={isPending}

              label={isPending ? "Saving..." : "Save"}

            />

            <ActionButton action="cancel" onClick={onCancel} />

          </div>

          {state.error ? (

            <p className={cn(alertErrorClassName, "text-xs sm:basis-full")}>

              {state.error}

            </p>

          ) : null}

        </form>

      </TableCell>

    </TableRow>

  );

}



function DeleteStudentButton({

  studentId,

  studentName,

}: {

  studentId: string;

  studentName: string;

}) {

  const [open, setOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);



  async function handleConfirm() {

    setIsDeleting(true);



    try {

      await deleteStudent(studentId);

      setOpen(false);

    } finally {

      setIsDeleting(false);

    }

  }



  return (

    <>

      <ActionButton

        action="delete"

        compact

        onClick={() => setOpen(true)}

        disabled={isDeleting}

      />



      <ConfirmDialog

        open={open}

        title={`Delete student ${studentId}?`}

        description={`${studentName} will be permanently removed. This cannot be undone.`}

        confirmLabel={isDeleting ? "Deleting..." : "Delete student"}

        cancelLabel="Cancel"

        variant="danger"

        isPending={isDeleting}

        onConfirm={handleConfirm}

        onCancel={() => {

          if (!isDeleting) {

            setOpen(false);

          }

        }}

      />

    </>

  );

}


