import java.io.IOException;

public class Main {

    public static void main(String[] args) {
        try {
            new Symfinder(args[0], args[1]).run();
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.exit(0);
    }
}
