
import { styled } from '@mui/material/styles';

import { DataGrid } from '@mui/x-data-grid';

import {
    useWordsList
} from '../../hook/useVocabulary'

import {
    TextM,
    TextL,
    Container,
    FlexDiv,
    WhiteSpace
} from '../../components'

import {
    GetBays
} from '../../hook/tools'


// lastStatus: 1
// lastTimestamp: 1754873644782
// learnTimes: 3
// rightTimes: 1
// word: "finally"
// wrongTimes: 0
const columns = [
  { field: 'lesson', headerName: 'Lesson', width: 70},
  { field: 'word', headerName: 'Word', width: 120 },
  { field: 'lastStatus', headerName: 'Last Status', width: 120},
  { field: 'wrongTimes', headerName: 'Wrong Times', width: 120},
  { field: 'rightTimes', headerName: 'Correct Times', width: 120},
  { field: 'learnTimes', headerName: 'Learn Times', width: 120},
  { field: 'lastTimestamp', headerName: 'Time since last study', width: 120},


//   {
//     field: 'fullName',
//     headerName: 'Full name',
//     description: 'This column has a value getter and is not sortable.',
//     sortable: false,
//     width: 160,
//     valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
//   },
];

function TextFlex({children, flex = 1}) {
    return <TextM style={{flex}}>{children}</TextM>
}

export function LessonSelect() {
     const {
        // loading,
        res
    } = useWordsList()
    const {
        hours,
        daysWithHours
    } = GetBays()
    console.log(
        res
    )
    return <>
        <DataGrid
            rows={
                res.map((v, lesson) => v.map((v,i) => ({
                    ...v,
                    lesson,
                    lastTimestamp: v.lastTimestamp === -1 ? 0 : daysWithHours(v.sicnceLastStudyHours).join('.')*1,
                    id: lesson + "_" + i
                }))).flat()
            }
            columns={columns}
            pageSizeOptions={[5, 10]}
            sx={{ border: 0 }}
        />
    </>
}


export default function Index() {
    return <LessonSelect />
}