import App from '../app'
import { Job } from '../queue'
import List from './List'
import ListStatsJob from './ListStatsJob'

export default class ProcessListsJob extends Job {
    static $name = 'process_lists_job'

    static async handler() {

        const lists = await List.all()
        for (const list of lists) {
            App.main.queue.enqueue(ListStatsJob.from(list.id, list.project_id))
        }
    }
}
