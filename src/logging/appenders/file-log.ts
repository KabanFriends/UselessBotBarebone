import * as logging from "../logging"
import { Config, LayoutFunction, LayoutsParam, LoggingEvent } from "log4js";

function appender(layout: LayoutFunction) {
    return (loggingEvent: LoggingEvent) => {
        logging.writeLogLine(layout(loggingEvent));
    };
}

function configure(config: Config, layouts?: LayoutsParam) {
    if (layouts === undefined) {
        throw ReferenceError("No layout specified");
    }
    let layout = layouts.colouredLayout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }   
    return appender(layout);
}

export const fileLogAppender = { configure };
